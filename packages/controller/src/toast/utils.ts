export const TOAST_CONTAINER_ID = "cartridge-toast-container";
export const DEFAULT_DURATION = 3000;
export const DEFAULT_POSITION = "bottom-right";
export const TOAST_MESSAGE_TYPE = "cartridge-toast-show";

// Check if we're in an iframe
export function isInIframe(): boolean {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in an iframe
  }
}

// Get the target document (parent if in iframe, current if not)
export function getTargetDocument(): Document | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (isInIframe()) {
    try {
      // Try to access parent document
      if (window.parent && window.parent.document) {
        return window.parent.document;
      }
    } catch (e) {
      console.warn("Failed to access parent document:", e);
      return null;
    }
  }

  return document;
}

// Get or create toast container
export function getToastContainer(
  targetDoc: Document,
  position: string,
): HTMLElement {
  let container = targetDoc.getElementById(TOAST_CONTAINER_ID);

  if (!container) {
    container = targetDoc.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    if (targetDoc.body) {
      targetDoc.body.appendChild(container);
    }
  }

  // Update position class
  container.className = position;

  return container;
}

// Remove toast with animation
export function removeToast(toast: HTMLElement): void {
  toast.classList.add("closing");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 200);
}
