import { ToastOptions, ToastType } from "./types";

const TOAST_CONTAINER_ID = "cartridge-toast-container";
const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION = "bottom-right";
const TOAST_MESSAGE_TYPE = "cartridge-toast-show";

// Check if we're in an iframe
function isInIframe(): boolean {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in an iframe
  }
}

// Get the target document (parent if in iframe, current if not)
function getTargetDocument(): Document | null {
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
      // Cross-origin iframe, can't access parent document directly
      // Will use postMessage instead
      return null;
    }
  }

  return document;
}

// Inject CSS styles if not already present
function injectStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-styles";
  style.textContent = `
    #${TOAST_CONTAINER_ID} {
      position: fixed;
      z-index: 999999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    #${TOAST_CONTAINER_ID}.top-left {
      top: 20px;
      left: 20px;
      align-items: flex-start;
    }

    #${TOAST_CONTAINER_ID}.top-right {
      top: 20px;
      right: 20px;
      align-items: flex-end;
    }

    #${TOAST_CONTAINER_ID}.top-center {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
    }

    #${TOAST_CONTAINER_ID}.bottom-left {
      bottom: 20px;
      left: 20px;
      align-items: flex-start;
    }

    #${TOAST_CONTAINER_ID}.bottom-right {
      bottom: 20px;
      right: 20px;
      align-items: flex-end;
    }

    #${TOAST_CONTAINER_ID}.bottom-center {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
    }

    .cartridge-toast {
      background: #ffffff;
      color: #1a1a1a;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 400px;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      animation: cartridge-toast-slide-in 0.3s ease-out;
      border-left: 4px solid;
    }

    .cartridge-toast.success {
      border-left-color: #10b981;
    }

    .cartridge-toast.error {
      border-left-color: #ef4444;
    }

    .cartridge-toast.info {
      border-left-color: #3b82f6;
    }

    .cartridge-toast.warning {
      border-left-color: #f59e0b;
    }

    .cartridge-toast-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cartridge-toast-message {
      flex: 1;
      word-wrap: break-word;
    }

    .cartridge-toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s;
    }

    .cartridge-toast-close:hover {
      background-color: #f3f4f6;
      color: #1a1a1a;
    }

    .cartridge-toast-close:active {
      background-color: #e5e7eb;
    }

    @keyframes cartridge-toast-slide-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cartridge-toast.closing {
      animation: cartridge-toast-slide-out 0.2s ease-in forwards;
    }

    @keyframes cartridge-toast-slide-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    @media (max-width: 640px) {
      .cartridge-toast {
        min-width: calc(100vw - 40px);
        max-width: calc(100vw - 40px);
      }

      #${TOAST_CONTAINER_ID}.top-left,
      #${TOAST_CONTAINER_ID}.top-right,
      #${TOAST_CONTAINER_ID}.top-center {
        top: 10px;
        left: 20px;
        right: 20px;
        transform: none;
        align-items: stretch;
      }

      #${TOAST_CONTAINER_ID}.bottom-left,
      #${TOAST_CONTAINER_ID}.bottom-right,
      #${TOAST_CONTAINER_ID}.bottom-center {
        bottom: 10px;
        left: 20px;
        right: 20px;
        transform: none;
        align-items: stretch;
      }
    }
  `;
  targetDoc.head.appendChild(style);
}

// Get or create toast container
function getToastContainer(targetDoc: Document, position: string): HTMLElement {
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

// Get icon SVG based on type
function getIconSvg(type: ToastType): string {
  const icons = {
    success: `<svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>`,
    error: `<svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
    </svg>`,
    info: `<svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
    </svg>`,
    warning: `<svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
    </svg>`,
  };
  return icons[type];
}

// Create toast element
function createToastElement(options: ToastOptions): HTMLElement {
  const toast = document.createElement("div");
  toast.className = `cartridge-toast ${options.type || "info"}`;

  const icon = document.createElement("div");
  icon.className = "cartridge-toast-icon";
  icon.innerHTML = getIconSvg(options.type || "info");
  icon.style.color = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
  }[options.type || "info"];

  const message = document.createElement("div");
  message.className = "cartridge-toast-message";
  message.textContent = options.message;

  const closeButton = document.createElement("button");
  closeButton.className = "cartridge-toast-close";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
  </svg>`;

  toast.appendChild(icon);
  toast.appendChild(message);
  toast.appendChild(closeButton);

  return toast;
}

// Remove toast with animation
function removeToast(toast: HTMLElement): void {
  toast.classList.add("closing");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 200);
}

// Show toast on target document (parent or current)
function showToastOnDocument(
  targetDoc: Document,
  options: ToastOptions,
): () => void {
  // Inject styles if needed
  injectStyles(targetDoc);

  // Get container
  const position = options.position || DEFAULT_POSITION;
  const container = getToastContainer(targetDoc, position);

  // Create toast element
  const toastElement = createToastElement(options);

  // Add to container
  container.appendChild(toastElement);

  // Setup close button
  const closeButton = toastElement.querySelector(".cartridge-toast-close");
  const dismiss = () => removeToast(toastElement);
  if (closeButton) {
    closeButton.addEventListener("click", dismiss);
  }

  // Auto-dismiss if duration is set
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const duration = options.duration ?? DEFAULT_DURATION;
  if (duration > 0) {
    timeoutId = setTimeout(dismiss, duration);
  }

  // Return dismiss function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    dismiss();
  };
}

// Set up message listener on parent window to handle toast requests from iframes
let messageListenerSetup = false;
function setupMessageListener(): void {
  if (messageListenerSetup || typeof window === "undefined") {
    return;
  }

  // Only set up listener on parent window (not in iframe)
  if (isInIframe()) {
    return;
  }

  window.addEventListener("message", (event) => {
    // Basic origin check - in production, you might want stricter checks
    if (event.data?.type === TOAST_MESSAGE_TYPE && event.data?.options) {
      const targetDoc = document;
      if (targetDoc) {
        showToastOnDocument(targetDoc, event.data.options);
      }
    }
  });

  messageListenerSetup = true;
}

/**
 * Show a toast notification
 *
 * The toast will always appear on the parent page, even if called from within an iframe.
 * This ensures toasts are visible above all content, including the keychain iframe.
 *
 * @param options - Toast options including message, type, duration, and position
 * @returns A function to manually dismiss the toast
 *
 * @example
 * ```ts
 * import { toast } from "@cartridge/controller";
 *
 * // Simple usage with string
 * toast("Hello, world!");
 *
 * // With options
 * toast({
 *   message: "Transaction successful!",
 *   type: "success",
 *   duration: 5000,
 *   position: "bottom-right"
 * });
 *
 * // Manual dismissal
 * const dismiss = toast({ message: "Persistent toast", duration: 0 });
 * dismiss();
 * ```
 */
export function toast(options: ToastOptions | string): () => void {
  // Handle string shorthand
  const toastOptions: ToastOptions =
    typeof options === "string" ? { message: options } : options;

  // Ensure we're in a browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    console.warn("Toast can only be used in a browser environment");
    return () => {};
  }

  // Set up message listener on parent window if not already set up
  setupMessageListener();

  // Check if we're in an iframe
  if (isInIframe()) {
    // Try to get parent document
    const targetDoc = getTargetDocument();

    if (targetDoc) {
      // Same-origin iframe, can access parent document directly
      return showToastOnDocument(targetDoc, toastOptions);
    } else {
      // Cross-origin iframe, use postMessage
      try {
        if (window.parent) {
          window.parent.postMessage(
            {
              type: TOAST_MESSAGE_TYPE,
              options: toastOptions,
            },
            "*", // In production, specify target origin
          );
        }
      } catch (e) {
        console.warn("Failed to send toast message to parent:", e);
      }

      // Return a no-op dismiss function for cross-origin case
      return () => {};
    }
  } else {
    // Not in iframe, show toast directly on current document
    const targetDoc = document;
    return showToastOnDocument(targetDoc, toastOptions);
  }
}

export * from "./types";

// Initialize message listener when module loads (if in browser environment)
if (typeof window !== "undefined") {
  setupMessageListener();
}
