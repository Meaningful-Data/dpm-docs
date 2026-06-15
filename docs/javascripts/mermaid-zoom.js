// Make rendered Mermaid diagrams clickable: open a fullscreen lightbox with
// pan/zoom (via svg-pan-zoom) plus an "open in new tab" action.
//
// IMPORTANT: Material for MkDocs renders each diagram into a SHADOW ROOT
// attached to the <div class="mermaid"> container (to isolate Mermaid's CSS).
// A normal `.mermaid svg` query cannot cross the shadow boundary, so we must
// read the <svg> via container.shadowRoot. Rendering is async and also happens
// on instant-navigation page changes, so we watch the DOM with a
// MutationObserver and bind each diagram once its <svg> exists.

(function () {
  "use strict";

  // Material attaches a CLOSED shadow root to each diagram container
  // (`attachShadow({mode:"closed"})`), which makes `container.shadowRoot`
  // return null — so the rendered <svg> is unreachable from outside. We run
  // before Material renders (it loads Mermaid from a CDN first, then renders),
  // so patch attachShadow to force "open" mode, keeping the shadow root
  // accessible. Material still works with an open root.
  if (Element.prototype.attachShadow && !Element.prototype.__zoomPatched) {
    var nativeAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (init) {
      var opts = init || {};
      if (opts.mode === "closed") {
        opts = { mode: "open" };
        for (var k in init) { if (k !== "mode") opts[k] = init[k]; }
      }
      return nativeAttachShadow.call(this, opts);
    };
    Element.prototype.__zoomPatched = true;
  }

  var BOUND = "data-zoom-bound";

  // Intrinsic pixel size of a rendered diagram (viewBox first, then layout box).
  function svgSize(svg) {
    var vb = svg.viewBox && svg.viewBox.baseVal;
    var r = svg.getBoundingClientRect();
    return {
      w: Math.ceil((vb && vb.width) || r.width || 800),
      h: Math.ceil((vb && vb.height) || r.height || 600)
    };
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  // Replace Mermaid's HTML <foreignObject> labels with native SVG <text> in the
  // clone, reading font/colour from the corresponding LIVE element. Canvas
  // rasterisation taints (and then refuses to export) any SVG containing a
  // foreignObject, so this is required to produce a downloadable PNG. Labels
  // are single-line (white-space:nowrap), so one <text> per label is faithful.
  function flattenForeignObjects(liveSvg, cloneSvg) {
    var live = liveSvg.querySelectorAll("foreignObject");
    var clones = cloneSvg.querySelectorAll("foreignObject");
    for (var i = 0; i < clones.length; i++) {
      var fo = clones[i];
      var text = (fo.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) { if (fo.parentNode) fo.parentNode.removeChild(fo); continue; }
      var w = parseFloat(fo.getAttribute("width")) || 0;
      var h = parseFloat(fo.getAttribute("height")) || 0;
      var liveInner = (live[i] && (live[i].querySelector("span, p, div") || live[i]));
      var cs = liveInner ? getComputedStyle(liveInner) : null;
      var t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("x", w / 2);
      t.setAttribute("y", h / 2);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "central");
      t.setAttribute("style",
        "font-family:" + (cs ? cs.fontFamily : "sans-serif") + ";" +
        "font-size:" + (cs ? cs.fontSize : "16px") + ";" +
        "fill:" + (cs ? cs.color : "#000") + ";");
      t.textContent = text;
      fo.parentNode.replaceChild(t, fo);
    }
  }

  // Produce a self-contained SVG element: Mermaid's styles reference CSS custom
  // properties (--md-mermaid-*) defined on :root, which are absent once the SVG
  // is taken out of the page (new tab / canvas). Resolve every var() it uses
  // from the document root and pin them onto the clone so it renders correctly
  // standalone. Also give it explicit pixel dimensions for rasterisation.
  // When `flatten` is set, convert foreignObject labels to <text> (for PNG).
  function standaloneSvg(svg, flatten) {
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", SVG_NS);
    var size = svgSize(svg);
    clone.setAttribute("width", size.w);
    clone.setAttribute("height", size.h);
    if (flatten) flattenForeignObjects(svg, clone);

    var used = {}, m, re = /var\((--[\w-]+)/g, html = clone.outerHTML;
    while ((m = re.exec(html))) used[m[1]] = true;
    // Resolve from the LIVE svg: Material's --md-mermaid-* vars are in scope
    // there (inherited from body), but NOT on documentElement.
    var root = getComputedStyle(svg);
    var decls = "";
    Object.keys(used).forEach(function (name) {
      var val = root.getPropertyValue(name).trim();
      if (val) decls += name + ":" + val + ";";
    });
    if (decls) clone.setAttribute("style", (clone.getAttribute("style") || "") + decls);
    return { node: clone, size: size };
  }

  function serializeSvg(svg) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      new XMLSerializer().serializeToString(standaloneSvg(svg).node);
  }

  function openInNewTab(svg) {
    var blob = new Blob([serializeSvg(svg)], { type: "image/svg+xml" });
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // Rasterise the SVG to a PNG (2x for crispness) on a white background.
  function downloadPng(svg, button) {
    var built = standaloneSvg(svg, true); // flatten foreignObjects to avoid taint
    var scale = 2;
    var w = built.size.w, h = built.size.h;
    var blob = new Blob(
      ['<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(built.node)],
      { type: "image/svg+xml;charset=utf-8" }
    );
    var url = URL.createObjectURL(blob);
    var img = new Image();
    var label = button && button.textContent;
    function restore() { if (button && label != null) button.textContent = label; }
    img.onload = function () {
      try {
        var canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(function (png) {
          if (png) triggerDownload(png, "diagram.png");
          else fallback();
          restore();
        }, "image/png");
      } catch (e) { fallback(); restore(); }
      URL.revokeObjectURL(url);
    };
    img.onerror = function () { URL.revokeObjectURL(url); fallback(); restore(); };
    function fallback() {
      // If rasterisation is blocked (e.g. tainted canvas), fall back to the SVG.
      triggerDownload(new Blob([serializeSvg(svg)], { type: "image/svg+xml" }), "diagram.svg");
    }
    if (button) button.textContent = "Rendering…";
    img.src = url;
  }

  function openModal(svg) {
    var overlay = document.createElement("div");
    overlay.className = "mermaid-modal";

    var toolbar = document.createElement("div");
    toolbar.className = "mermaid-modal__toolbar";

    var pngBtn = document.createElement("button");
    pngBtn.type = "button";
    pngBtn.className = "mermaid-modal__btn";
    pngBtn.textContent = "Download PNG";
    pngBtn.addEventListener("click", function () { downloadPng(svg, pngBtn); });

    var openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "mermaid-modal__btn";
    openBtn.textContent = "Open in new tab";
    openBtn.addEventListener("click", function () { openInNewTab(svg); });

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "mermaid-modal__btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕"; // ✕

    toolbar.appendChild(pngBtn);
    toolbar.appendChild(openBtn);
    toolbar.appendChild(closeBtn);

    var stage = document.createElement("div");
    stage.className = "mermaid-modal__stage";

    var clone = svg.cloneNode(true);
    clone.removeAttribute("style");
    clone.style.width = "100%";
    clone.style.height = "100%";
    stage.appendChild(clone);

    overlay.appendChild(toolbar);
    overlay.appendChild(stage);
    document.body.appendChild(overlay);
    document.body.classList.add("mermaid-modal-open");

    var panZoom = null;
    if (typeof svgPanZoom !== "undefined") {
      // Defer so the SVG is laid out before svg-pan-zoom measures it.
      requestAnimationFrame(function () {
        try {
          panZoom = svgPanZoom(clone, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.5,
            maxZoom: 20
          });
        } catch (e) { /* graceful fallback: static enlarged view */ }
      });
    }

    function close() {
      if (panZoom) { try { panZoom.destroy(); } catch (e) {} }
      document.body.removeChild(overlay);
      document.body.classList.remove("mermaid-modal-open");
      document.removeEventListener("keydown", onKey);
    }

    function onKey(e) { if (e.key === "Escape") close(); }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target === stage) close();
    });
    document.addEventListener("keydown", onKey);
  }

  // --- Self-loop compaction -------------------------------------------------
  // In erDiagrams a self-referential relationship (e.g. a parent/owner FK,
  // `DPMClass ||--o{ DPMClass`) is routed by Mermaid's dagre layout through
  // tall virtual ranks, so it balloons into a huge arc sprawling far from its
  // entity — it neither reads as "points back to itself" nor stays near the
  // box. Mermaid exposes no config for this, so we reshape it after render:
  // each self-loop is three <path> segments with ids ending
  // `-cyclic-special-{1,mid,2}`. We replace them with a small tidy loop hugging
  // the entity's right edge and move the relationship label beside it.
  var LOOP_BULGE = 60;  // how far the loop extends past the entity's right edge
  var LOOP_GAP = 26;    // vertical half-distance between the two anchor points

  function parseTranslate(el) {
    var t = el && el.getAttribute("transform");
    var m = t && /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(t);
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
  }

  // Centre point of a path, sampled before we overwrite it (used to match the
  // loop to its far-flung relationship label).
  function pathMidpoint(p) {
    try {
      var len = p.getTotalLength();
      var pt = p.getPointAtLength(len / 2);
      return { x: pt.x, y: pt.y };
    } catch (e) { return null; }
  }

  function compactSelfLoops(svg) {
    if (svg.hasAttribute("data-loops-fixed")) return;
    svg.setAttribute("data-loops-fixed", "true");

    // Group the three segments of each loop by their shared id prefix.
    var groups = {};
    svg.querySelectorAll('path[id*="-cyclic-special-"]').forEach(function (p) {
      var m = /^(.*)-cyclic-special-(1|mid|2)$/.exec(p.id);
      if (!m) return;
      (groups[m[1]] || (groups[m[1]] = {}))[m[2]] = p;
    });

    var labels = Array.prototype.slice.call(svg.querySelectorAll("g.edgeLabel"));

    Object.keys(groups).forEach(function (prefix) {
      var g = groups[prefix];
      if (!g["1"] || !g.mid || !g["2"]) return;

      // The entity node shares the prefix (minus the `-cyclic-special` tail).
      var node = svg.querySelector('[id="' + prefix.replace(/-cyclic-special$/, "") + '"]');
      if (!node) return;
      var pos = parseTranslate(node);
      if (!pos) return;
      var bb = node.getBBox();
      var rx = pos.x + bb.x + bb.width;        // right edge, in path/label space
      var cy = pos.y + bb.y + bb.height / 2;   // vertical centre

      // Capture the old apex BEFORE rewriting, to find this loop's label.
      var apex = pathMidpoint(g.mid);

      var top = cy - LOOP_GAP, bot = cy + LOOP_GAP, ox = rx + LOOP_BULGE;
      // Upper half carries the start marker; lower half the end marker.
      g["1"].setAttribute("d",
        "M" + rx + "," + top + " C" + ox + "," + top + " " + ox + "," + cy + " " + ox + "," + cy);
      g["2"].setAttribute("d",
        "M" + ox + "," + cy + " C" + ox + "," + bot + " " + ox + "," + bot + " " + rx + "," + bot);
      g.mid.setAttribute("d", "M" + ox + "," + cy + " L" + ox + "," + cy); // hidden

      // Move the relationship label (the one nearest the old apex) beside the loop.
      if (!apex) return;
      var best = null, bestD = Infinity;
      labels.forEach(function (lab) {
        var lp = parseTranslate(lab);
        if (!lp) return;
        var d = Math.pow(lp.x - apex.x, 2) + Math.pow(lp.y - apex.y, 2);
        if (d < bestD) { bestD = d; best = lab; }
      });
      if (best) {
        var lw = best.getBBox().width;
        best.setAttribute("transform", "translate(" + (ox + 10 + lw / 2) + "," + cy + ")");
      }
    });
  }

  // The <svg> may live in the container's shadow root (Material) or directly
  // in the light DOM (other setups); support both.
  function getSvg(container) {
    return (container.shadowRoot && container.shadowRoot.querySelector("svg")) ||
      container.querySelector("svg");
  }

  function bind() {
    document.querySelectorAll(".mermaid").forEach(function (container) {
      if (container.hasAttribute(BOUND)) return;
      var svg = getSvg(container);
      if (!svg) return; // not rendered yet; retry on next mutation
      container.setAttribute(BOUND, "true");
      compactSelfLoops(svg);
      container.classList.add("mermaid-zoomable");
      container.addEventListener("click", function () {
        var svg = getSvg(container);
        if (svg) openModal(svg);
      });
    });
  }

  // Mermaid renders each diagram asynchronously (and Material can render them
  // late, or lazily on scroll), so a fixed polling window misses the slow ones.
  // Instead, watch the DOM continuously and bind every diagram the moment its
  // <svg> appears. bind() is idempotent (guarded by the BOUND attribute).
  var scanQueued = false;
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    setTimeout(function () { scanQueued = false; bind(); }, 80);
  }

  function start() {
    bind(); // catch anything already rendered
    var observer = new MutationObserver(queueScan);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Material re-emits document$ on every instant-navigation page change; the
  // observer on document.body already survives those, but re-scan to be safe.
  if (typeof document$ !== "undefined") {
    document$.subscribe(bind);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
