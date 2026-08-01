(function () {
  "use strict";

  const CONFIG = {
    WIDGET_URL: "https://support-platform-widget-lime.vercel.app/widget",
    DEFAULT_POSITION: "bottom-right",
    DEFAULT_COLOR: "#3b82f6",
  };

  const VALID_POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"];

  const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`;

  const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;

  (function () {
    let iframe = null;
    let container = null;
    let button = null;
    let isOpen = false;
    let organizationId = null;
    let position = CONFIG.DEFAULT_POSITION;

    let currentColor = CONFIG.DEFAULT_COLOR;

    function getScript() {
      return (
        document.currentScript ||
        document.querySelector("script[data-organization-id]")
      );
    }
     
    function resolvePosition(value) {
      if (!value) return CONFIG.DEFAULT_POSITION;
 
      if (VALID_POSITIONS.indexOf(value) === -1) {
        console.warn(
          `Echo Widget: invalid data-position "${value}". ` +
            `Expected one of: ${VALID_POSITIONS.join(", ")}. ` +
            `Falling back to "${CONFIG.DEFAULT_POSITION}".`
        );
        return CONFIG.DEFAULT_POSITION;
      }
 
      return value;
    }
 
    function getPositionStyles(pos) {
      const isTop = pos.indexOf("top") === 0;
      const isLeft = pos.indexOf("left") !== -1;
 
      const horizontal = isLeft ? "left: 20px;" : "right: 20px;";
      const buttonVertical = isTop ? "top: 20px;" : "bottom: 20px;";
      const containerVertical = isTop ? "top: 90px;" : "bottom: 90px;";
 
      return {
        button: `${buttonVertical} ${horizontal}`,
        container: `${containerVertical} ${horizontal}`,
      };
    }
    const embedScript = getScript();

    if (!embedScript) {
      console.error("Echo Widget: script tag not found");
      return;
    }

    organizationId = embedScript.getAttribute("data-organization-id");

    if (!organizationId) {
      console.error("Echo Widget: data-organization-id attribute is required");
      return;
    }

    position = resolvePosition(embedScript.getAttribute("data-position"));

    function hexToRgbString(hex) {
      const match = /^#?([0-9a-f]{6})$/i.exec(hex || "");
      if (!match) return "59, 130, 246"; // default blue fallback
      const intVal = parseInt(match[1], 16);
      const red = (intVal >> 16) & 255;
      const green = (intVal >> 8) & 255;
      const blue = intVal & 255;
      return `${red}, ${green}, ${blue}`;
    }

    function applyBranding() {
      if (!button) return;
      const rgb = hexToRgbString(currentColor);
      button.style.background = currentColor;
      button.style.boxShadow = `0 4px 24px rgba(${rgb}, 0.35)`;
    }

    function initWhenReady() {
      document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", render)
        : render();
    }

    function render() {
      const positionStyles = getPositionStyles(position);
      
      button = document.createElement("button");
      button.id = "echo-widget-button";
      button.innerHTML = CHAT_ICON;
      button.style.cssText = `
        position: fixed;
        ${position === "bottom-right" ? "right: 20px;" : "left: 20px;"}
        bottom: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        color: white;
        border: none;
        cursor: pointer;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      `;
      applyBranding();

      button.addEventListener("click", toggleWidget);
      button.addEventListener("mouseenter", () => {
        if (button) button.style.transform = "scale(1.05)";
      });
      button.addEventListener("mouseleave", () => {
        if (button) button.style.transform = "scale(1)";
      });
      document.body.appendChild(button);

      container = document.createElement("div");
      container.id = "echo-widget-container";
      container.style.cssText = `
        position: fixed;
        ${position === "bottom-right" ? "right: 20px;" : "left: 20px;"}
        bottom: 90px;
        width: 400px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 110px);
        z-index: 999998;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        display: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
      `;

      iframe = document.createElement("iframe");
      iframe.src = buildIframeUrl();
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      iframe.allow = "microphone; clipboard-read; clipboard-write";
      container.appendChild(iframe);
      document.body.appendChild(container);

      window.addEventListener("message", handleMessage);
    }

    function buildIframeUrl() {
      const params = new URLSearchParams();
      params.append("organizationId", organizationId);
      return `${CONFIG.WIDGET_URL}?${params.toString()}`;
    }

    function handleMessage(event) {
      if (event.origin !== new URL(CONFIG.WIDGET_URL).origin) return;

      const { type, payload } = event.data;
      switch (type) {
        case "close":
          closeWidget();
          break;
        case "resize":
          if (payload.height && container) {
            container.style.height = `${payload.height}px`;
          }
          break;
        case "branding":
          if (payload && payload.primaryColor) {
            currentColor = payload.primaryColor;
            applyBranding();
          }
          break;
      }
    }

    function toggleWidget() {
      isOpen ? closeWidget() : openWidget();
    }

    function openWidget() {
      if (!container || !button) return;
      isOpen = true;
      container.style.display = "block";
      setTimeout(() => {
        if (container) {
          container.style.opacity = "1";
          container.style.transform = "translateY(0)";
        }
      }, 10);
      button.innerHTML = CLOSE_ICON;
    }

    function closeWidget() {
      if (!container || !button) return;
      isOpen = false;
      container.style.opacity = "0";
      container.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (container) container.style.display = "none";
      }, 300);
      button.innerHTML = CHAT_ICON;
      applyBranding();
    }

    function destroyWidget() {
      window.removeEventListener("message", handleMessage);
      if (container) {
        container.remove();
        container = null;
        iframe = null;
      }
      if (button) {
        button.remove();
        button = null;
      }
      isOpen = false;
    }

    function reinit(options) {
      destroyWidget();
      if (options.organizationId) organizationId = options.organizationId;
      if (options.position) position = resolvePosition(options.position);
      initWhenReady();
    }

    window.EchoWidget = {
      init: reinit,
      show: openWidget,
      hide: closeWidget,
      destroy: destroyWidget,
    };

    initWhenReady();
  })();
})();