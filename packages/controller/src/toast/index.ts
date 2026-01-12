import { ToastOptions } from "./types";
import {
  isInIframe,
  getTargetDocument,
  getToastContainer,
  DEFAULT_DURATION,
  DEFAULT_POSITION,
  TOAST_MESSAGE_TYPE,
  removeToast,
} from "./utils";
import { injectStyles } from "./styles";
import {
  injectErrorStyles,
  createErrorToast,
  injectTransactionStyles,
  createTransactionToast,
  injectNetworkSwitchStyles,
  createNetworkSwitchToast,
  injectAchievementStyles,
  createAchievementToast,
  injectQuestStyles,
  createQuestToast,
  injectMarketplaceStyles,
  createMarketplaceToast,
} from "./variants";
import { addProgressBarToToast } from "./utils/progress-bar";

// Create toast element based on variant
function createToastElement(options: ToastOptions): HTMLElement {
  switch (options.variant) {
    case "error":
      return createErrorToast(options);
    case "transaction":
      return createTransactionToast(options);
    case "network-switch":
      return createNetworkSwitchToast(options);
    case "achievement":
      return createAchievementToast(options);
    case "quest":
      return createQuestToast(options);
    case "marketplace":
      return createMarketplaceToast(options);
  }
}

// Inject variant-specific styles
function injectVariantStyles(
  targetDoc: Document,
  variant: ToastOptions["variant"],
): void {
  switch (variant) {
    case "error":
      injectErrorStyles(targetDoc);
      break;
    case "transaction":
      injectTransactionStyles(targetDoc);
      break;
    case "network-switch":
      injectNetworkSwitchStyles(targetDoc);
      break;
    case "achievement":
      injectAchievementStyles(targetDoc);
      break;
    case "quest":
      injectQuestStyles(targetDoc);
      break;
    case "marketplace":
      injectMarketplaceStyles(targetDoc);
      break;
  }
}

// Show toast on target document (parent or current)
function showToastOnDocument(
  targetDoc: Document,
  options: ToastOptions,
): () => void {
  // Inject common styles if needed
  injectStyles(targetDoc);

  // Inject variant-specific styles
  injectVariantStyles(targetDoc, options.variant);

  // Get container
  const position = options.position || DEFAULT_POSITION;
  const container = getToastContainer(targetDoc, position);

  // Create toast element
  const toastElement = createToastElement(options);

  // Set up dismiss function
  const dismiss = () => removeToast(toastElement);

  // Add to container
  container.appendChild(toastElement);

  // Setup click handler if provided
  if (options.onClick) {
    toastElement.style.cursor = "pointer";
    toastElement.addEventListener("click", (e) => {
      // Don't trigger onClick if clicking close button
      const target = e.target as HTMLElement;
      const isCloseButton = target.closest("#close-button");
      if (!isCloseButton && options.onClick) {
        options.onClick();
      }
    });
  }

  // Setup close button
  const closeButton = toastElement.querySelector("#close-button");
  if (closeButton) {
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent onClick from firing
      dismiss();
    });
  }

  // Handle duration and progress bar
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const duration = options.duration ?? DEFAULT_DURATION;
  const isInfiniteDuration = !isFinite(duration) || duration <= 0;

  // Add progress bar to all variants except network-switch
  if (options.variant !== "network-switch") {
    // Determine border radius based on variant
    const borderRadius =
      options.variant === "error" || options.variant === "transaction" ? 8 : 4;

    if (isInfiniteDuration) {
      // Show static progress bar for infinite duration (no animation, no auto-dismiss)
      addProgressBarToToast(toastElement, Infinity, () => {}, borderRadius);
    } else {
      // Animated progress bar with auto-dismiss
      addProgressBarToToast(toastElement, duration, dismiss, borderRadius);
    }
  } else if (!isInfiniteDuration) {
    // Network-switch variant uses setTimeout instead of progress bar
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
 * @param options - Toast options with variant-specific properties
 * @returns A function to manually dismiss the toast
 *
 * @example
 * ```ts
 * import { toast } from "@cartridge/controller";
 *
 * // Error toast
 * toast({
 *   variant: "error",
 *   message: "Transaction failed",
 * });
 *
 * // Transaction toast
 * toast({
 *   variant: "transaction",
 *   hash: "0x1234...",
 *   status: "success",
 *   amount: "100",
 *   token: "ETH"
 * });
 *
 * // Network switch toast
 * toast({
 *   variant: "network-switch",
 *   networkName: "Mainnet",
 *   networkIcon: <url to icon image>
 * });
 *
 * // Achievement toast
 * toast({
 *   variant: "achievement",
 *   itemName: "First Achievement",
 *   itemImage: "https://example.com/trophy.png"
 *   action: "purchased" | "sold",
 * });
 *
 * // Marketplace toast
 * toast({
 *   variant: "marketplace",
 *   itemName: "Cool NFT #123",
 *   action: "purchased",
 *   price: "0.5",
 *   currency: "ETH",
 *   image: "https://example.com/nft.png"
 * });
 * ```
 */
export function toast(options: ToastOptions): () => void {
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
      return showToastOnDocument(targetDoc, options);
    } else {
      // Cross-origin iframe, use postMessage
      try {
        if (window.parent) {
          window.parent.postMessage(
            {
              type: TOAST_MESSAGE_TYPE,
              options: options,
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
    return showToastOnDocument(targetDoc, options);
  }
}

export * from "./types";

// Initialize message listener when module loads (if in browser environment)
if (typeof window !== "undefined") {
  setupMessageListener();
}
