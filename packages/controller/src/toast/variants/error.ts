import { ErrorToastOptions } from "../types";
import { CloseButton } from "../components/close-button";

// Inject error toast specific styles
export function injectErrorStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-error-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-error-styles";
  style.textContent = `
    /* Error Toast */
    .cartridge-toast.error {
      background-color: #E66666;
      border-radius: 8px;
      width: 360px;
      display: flex;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      transition: background-color 0.2s ease, transform 0.1s ease;
    }

    /* Clickable state */
    .cartridge-toast.error[style*="cursor: pointer"]:hover {
      background-color: #D85555;
      transform: translateY(-2px);
    }

    .cartridge-toast.error[style*="cursor: pointer"]:active {
      transform: translateY(0);
    }

    .cartridge-toast.error .label-bar {
      display: flex;
      padding: 12px 12px 16px 12px;
      align-items: center;
      gap: 8px;
      flex: 1 0 0;
    }

    .cartridge-toast.error .label-bar .label-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cartridge-toast.error .label-bar .icon-container {
      width: 24px;
      height: 24px;
      aspect-ratio: 1/1;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
    }

    .cartridge-toast.error .label-bar p {
      color: #0F1410;
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }

    .cartridge-toast.error .close-button-container {
      display: flex;
      padding: 4px;
      align-items: center;
      gap: 10px;
    }

    .cartridge-toast.error {
      position: relative;
      overflow: hidden;
    }
  `;
  targetDoc.head.appendChild(style);
}

// Create error toast element
export function createErrorToast(options: ErrorToastOptions): HTMLElement {
  const toast = document.createElement("div");
  toast.className = "cartridge-toast error";

  const labelBar = document.createElement("div");
  labelBar.className = "label-bar";
  toast.appendChild(labelBar);

  const labelContainer = document.createElement("div");
  labelContainer.className = "label-container";
  labelBar.appendChild(labelContainer);

  const icon = document.createElement("div");
  icon.className = "icon-container";
  icon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.79313 0.326989L17.673 8.20771C18.109 8.6437 18.109 9.35713 17.673 9.79229L9.79229 17.673C9.3563 18.109 8.6437 18.109 8.20771 17.673L0.326989 9.79229C-0.108996 9.35713 -0.108996 8.6437 0.326989 8.20771L8.20856 0.326989C8.64454 -0.108996 9.35715 -0.108996 9.79313 0.326989ZM8.26159 4.84378C8.26159 4.37794 8.63953 4 9.10537 4C9.57121 4 9.94915 4.3797 9.94915 4.84378V9.34394C9.94915 9.80978 9.57121 10.1877 9.13701 10.1877C8.70282 10.1877 8.26159 9.81154 8.26159 9.34394V4.84378ZM9.10537 13.5628C8.49503 13.5628 8.00002 13.0678 8.00002 12.4575C8.00002 11.8472 8.49468 11.3521 9.10537 11.3521C9.71605 11.3521 10.2107 11.8472 10.2107 12.4575C10.2093 13.0671 9.71711 13.5628 9.10537 13.5628Z" fill="#0F1410"/>
  </svg>
`;
  labelContainer.appendChild(icon);

  const content = document.createElement("p");
  content.className = "content";
  content.textContent = options.message || "Error";
  labelContainer.appendChild(content);

  const closeButtonContainer = document.createElement("div");
  closeButtonContainer.className = "close-button-container";
  const closeButton = CloseButton(true);
  closeButtonContainer.appendChild(closeButton);
  toast.appendChild(closeButtonContainer);

  return toast;
}
