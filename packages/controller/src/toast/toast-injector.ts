import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@cartridge/ui";

/**
 * Injects the Toaster component from @cartridge/ui into the parent page.
 * This allows toast notifications to be displayed on the parent page when
 * triggered from the iframe.
 */
export function injectToaster() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  // Check if Toaster is already injected
  if (document.getElementById("controller-toaster-root")) {
    return;
  }

  // Create a root div for the Toaster
  const toasterRoot = document.createElement("div");
  toasterRoot.id = "controller-toaster-root";
  // Set high z-index to ensure toasts appear above the iframe (which has z-index 10000)
  toasterRoot.style.zIndex = "10001";
  toasterRoot.style.position = "fixed";
  toasterRoot.style.pointerEvents = "none"; // Allow clicks to pass through to elements below
  document.body.appendChild(toasterRoot);

  // Inject CSS to ensure toast elements have high z-index
  // The Toaster component uses z-[100] by default, we need to override it
  const styleId = "controller-toast-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #controller-toaster-root [role="region"] {
        z-index: 10001 !important;
      }
      #controller-toaster-root [role="region"] > ol {
        z-index: 10001 !important;
      }
      #controller-toaster-root [data-sonner-toast] {
        z-index: 10001 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Render the Toaster component directly
  const root = createRoot(toasterRoot);
  root.render(React.createElement(Toaster));
}
