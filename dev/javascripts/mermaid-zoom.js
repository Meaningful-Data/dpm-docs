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

  function serializeSvg(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("style");
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      new XMLSerializer().serializeToString(clone);
  }

  function openInNewTab(svg) {
    var blob = new Blob([serializeSvg(svg)], { type: "image/svg+xml" });
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  }

  function openModal(svg) {
    var overlay = document.createElement("div");
    overlay.className = "mermaid-modal";

    var toolbar = document.createElement("div");
    toolbar.className = "mermaid-modal__toolbar";

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

  // The <svg> may live in the container's shadow root (Material) or directly
  // in the light DOM (other setups); support both.
  function getSvg(container) {
    return (container.shadowRoot && container.shadowRoot.querySelector("svg")) ||
      container.querySelector("svg");
  }

  function bind() {
    document.querySelectorAll(".mermaid").forEach(function (container) {
      if (container.hasAttribute(BOUND)) return;
      if (!getSvg(container)) return; // not rendered yet; retry on next mutation
      container.setAttribute(BOUND, "true");
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
