import { TransactionToastOptions } from "../types";
import { createSVGIcon } from "../styles";
import { CloseButton } from "../components/close-button";

// Inject transaction toast specific styles
export function injectTransactionStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-transaction-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-transaction-styles";
  style.textContent = `
    /* Transaction Toast */
    .cartridge-toast.transaction {
      background-color: #161A17;
      border-radius: 8px;
      width: 360px;
      padding: 16px;
      gap: 12px;
      border-left: 4px solid;
    }

    .cartridge-toast.transaction.pending {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }

    .cartridge-toast.transaction.success {
      background: #f0fdf4;
      border-left-color: #10b981;
    }

    .cartridge-toast.transaction.failed {
      background: #fef2f2;
      border-left-color: #ef4444;
    }

    .cartridge-toast.transaction .cartridge-toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
    }

    .cartridge-toast.transaction.pending .cartridge-toast-icon {
      color: #f59e0b;
    }

    .cartridge-toast.transaction.success .cartridge-toast-icon {
      color: #10b981;
    }

    .cartridge-toast.transaction.failed .cartridge-toast-icon {
      color: #ef4444;
    }

    .cartridge-toast.transaction .cartridge-toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cartridge-toast.transaction .cartridge-toast-title {
      font-weight: 600;
      color: #1a1a1a;
    }

    .cartridge-toast.transaction .cartridge-toast-hash {
      font-size: 12px;
      color: #6b7280;
      font-family: monospace;
      word-break: break-all;
    }

    .cartridge-toast.transaction .cartridge-toast-amount {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
  `;
  targetDoc.head.appendChild(style);
}

// Create transaction toast element
export function createTransactionToast(
  options: TransactionToastOptions,
): HTMLElement {
  const toast = document.createElement("div");
  toast.className = `cartridge-toast transaction ${options.status}`;

  const statusIcons = {
    pending: createSVGIcon(
      '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>',
      "#f59e0b",
    ),
    success: createSVGIcon(
      '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
      "#10b981",
    ),
    failed: createSVGIcon(
      '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>',
      "#ef4444",
    ),
  };

  const icon = document.createElement("div");
  icon.className = "cartridge-toast-icon";
  icon.innerHTML = statusIcons[options.status];

  const content = document.createElement("div");
  content.className = "cartridge-toast-content";

  const title = document.createElement("div");
  title.className = "cartridge-toast-title";
  title.textContent =
    options.status === "pending"
      ? "Transaction Pending"
      : options.status === "success"
        ? "Transaction Successful"
        : "Transaction Failed";

  const hash = document.createElement("div");
  hash.className = "cartridge-toast-hash";
  hash.textContent = `${options.hash.slice(0, 6)}...${options.hash.slice(-4)}`;

  content.appendChild(title);
  content.appendChild(hash);

  if (options.amount) {
    const amount = document.createElement("div");
    amount.className = "cartridge-toast-amount";
    amount.textContent = `${options.amount} ${options.token || ""}`.trim();
    content.appendChild(amount);
  }

  const closeButtonContainer = document.createElement("div");
  closeButtonContainer.className = "close-button-container";
  const closeButton = CloseButton();
  closeButtonContainer.appendChild(closeButton);
  toast.appendChild(closeButtonContainer);

  toast.appendChild(icon);
  toast.appendChild(content);

  return toast;
}
