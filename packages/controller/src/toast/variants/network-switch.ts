import { sanitizeImageSrc } from "../../utils";
import { NetworkSwitchToastOptions } from "../types";

// Inject network switch toast specific styles
export function injectNetworkSwitchStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-network-switch-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-network-switch-styles";
  style.textContent = `
    /* Network Switch Toast */
    .cartridge-toast.network-switch {
      background-color: #161A17;
      border-radius: 8px;
      width: 360px;
      padding: 14px;
      gap: 12px;
    }

    .cartridge-toast.network-switch p.content {
      color: #ffffff;
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px; /* 142.857% */
    }
  `;
  targetDoc.head.appendChild(style);
}

// Create network switch toast element
export function createNetworkSwitchToast(
  options: NetworkSwitchToastOptions,
): HTMLElement {
  const toast = document.createElement("div");
  toast.className = "cartridge-toast network-switch";

  const icon = document.createElement(options.networkIcon ? "img" : "div");
  icon.className = "icon";
  icon.style.width = "24px";
  icon.style.height = "24px";
  icon.style.aspectRatio = "1/1";
  if (options.networkIcon) {
    (icon as HTMLImageElement).src = sanitizeImageSrc(options.networkIcon);
    (icon as HTMLImageElement).alt = options.networkName;
  } else {
    (icon as HTMLDivElement).style.backgroundColor = "#161A17";
    (icon as HTMLDivElement).innerHTML = options.networkName
      .charAt(0)
      .toUpperCase();
    (icon as HTMLDivElement).style.color = "#ffffff";
    (icon as HTMLDivElement).style.fontWeight = "600";
    (icon as HTMLDivElement).style.fontSize = "12px";
    (icon as HTMLDivElement).style.lineHeight = "16px";
    (icon as HTMLDivElement).style.textAlign = "center";
    (icon as HTMLDivElement).style.textTransform = "uppercase";
    (icon as HTMLDivElement).style.borderRadius = "4px";
    (icon as HTMLDivElement).style.padding = "4px";
  }

  const content = document.createElement("p");
  content.className = "content";
  content.textContent = `Switched to ${options.networkName}`;

  toast.appendChild(icon);
  toast.appendChild(content);

  return toast;
}
