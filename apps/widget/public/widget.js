(function () {
  "use strict";

  const CONFIG = {
    WIDGET_URL: "https://support-platform-widget-lime.vercel.app/widget",
    DEFAULT_POSITION: "bottom-right",
  };

  const VALID_POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"];

  // Skeleton launcher colors, used only until the widget posts branding.
  const SKELETON_BG = "#e4e4e7";        // zinc-200
  const SKELETON_PULSE_BG = "#f4f4f5";  // zinc-100, the bright sweep band
  const SKELETON_ICON_COLOR = "#a1a1aa"; // zinc-400, muted icon on the skeleton

  const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`;

  const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;

  // Injected once, so the skeleton circle can shimmer via a keyframe.
  const STYLE_ID = "echo-widget-styles";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes echo-widget-shimmer {
        0% { background-position: -120px 0; }
        100% { background-position: 120px 0; }
      }
      #echo-widget-button.echo-widget-skeleton {
        background-image: linear-gradient(
          100deg,
          ${SKELETON_BG} 30%,
          ${SKELETON_PULSE_BG} 50%,
          ${SKELETON_BG} 70%
        );
        background-size: 240px 100%;
        background-repeat: no-repeat;
        animation: echo-widget-shimmer 1.4s ease-in-out infinite;
      }
      #echo-widget-button.echo-widget-skeleton svg {
        color: ${SKELETON_ICON_COLOR};
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }

  (function () {
    let iframe = null;
    let container = null;
    let button = null;
    let isOpen = false;
    let organizationId = null;
    let position = CONFIG.DEFAULT_POSITION;

    // No default brand color: null until the widget posts one. The
    // launcher stays a shimmering skeleton (grey circle + chat icon)
    // until a real color arrives, then flips straight to branded —
    // there is no intermediate neutral/black state.
    let currentColor = null;
    let currentName = "Chat";
    let hasBranding = false;

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
      if (!match) return null;

      const intVal = parseInt(match[1], 16);
      const red = (intVal >> 16) & 255;
      const green = (intVal >> 8) & 255;
      const blue = intVal & 255;
      return `${red}, ${green}, ${blue}`;
    }

    // Pre-branding state: shimmering grey circle with a muted chat icon.
    function applySkeleton() {
      if (!button) return;
      button.classList.add("echo-widget-skeleton");
      button.style.background = "";       // shimmer gradient owns the bg
      button.style.boxShadow = "none";
      button.style.color = SKELETON_ICON_COLOR;
      if (!isOpen) button.innerHTML = CHAT_ICON;
    }

    function applyBranding() {
      if (!button) return;

      // No color yet → stay a shimmering skeleton. Never show black.
      if (!hasBranding || !currentColor) {
        applySkeleton();
        return;
      }

      // Real brand color: stop shimmer, white icon, apply color + glow.
      button.classList.remove("echo-widget-skeleton");
      button.style.color = "white";
      if (!isOpen) button.innerHTML = CHAT_ICON;

      const rgb = hexToRgbString(currentColor);
      button.style.background = currentColor;
      button.style.boxShadow = rgb ? `0 4px 24px rgba(${rgb}, 0.35)` : "none";
    }

    function applyName() {
      if (!button) return;
      button.setAttribute("aria-label", `${currentName} widget`);
    }

    function initWhenReady() {
      document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", render)
        : render();
    }

    function render() {
      injectStyles();

      const positionStyles = getPositionStyles(position);

      button = document.createElement("button");
      button.id = "echo-widget-button";
      button.style.cssText = `
        position: fixed;
        ${positionStyles.button}
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
      applySkeleton();
      applyName();

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
        ${positionStyles.container}
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
          // Only leave the skeleton once a real color is present.
          if (payload && payload.primaryColor) {
            hasBranding = true;
            currentColor = payload.primaryColor;
          }
          if (payload && payload.chatbotName) {
            currentName = payload.chatbotName;
          }
          applyBranding();
          applyName();
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
      hasBranding = false;
      currentColor = null;
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