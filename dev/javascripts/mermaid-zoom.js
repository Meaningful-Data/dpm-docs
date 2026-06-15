// Make rendered Mermaid diagrams clickable: open a fullscreen lightbox with
// pan/zoom (via svg-pan-zoom) plus an "open in new tab" action.
//
// Mermaid renders to inline <svg> asynchronously and Material re-renders on
// every instant-navigation page change, so we (re)bind on each document$ tick
// and poll briefly until the SVGs exist.

(function () {
  "use strict";

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

  function bind() {
    document.querySelectorAll(".mermaid svg").forEach(function (svg) {
      var container = svg.closest(".mermaid");
      if (!container || container.hasAttribute(BOUND)) return;
      container.setAttribute(BOUND, "true");
      container.classList.add("mermaid-zoomable");
      container.addEventListener("click", function () { openModal(svg); });
    });
  }

  function watch() {
    var tries = 0;
    var timer = setInterval(function () {
      bind();
      if (++tries > 24) clearInterval(timer); // ~6s of retries, then stop
    }, 250);
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(watch); // Material: runs on every page navigation
  } else {
    document.addEventListener("DOMContentLoaded", watch);
  }
})();
