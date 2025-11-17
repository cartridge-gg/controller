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
  document.body.appendChild(toasterRoot);

  // Render the Toaster component directly
  const root = createRoot(toasterRoot);
  root.render(React.createElement(Toaster));
}
