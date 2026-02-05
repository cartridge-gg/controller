import { MarketplaceToastOptions } from "../types";
import { CloseButton } from "../components/close-button";
import { sanitizeImageSrc } from "../../utils";

// Inject marketplace toast specific styles
export function injectMarketplaceStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-marketplace-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-marketplace-styles";
  style.textContent = `
    /* Marketplace Toast */
    .cartridge-toast.marketplace {
      background-color: #1E221F;
      border-radius: 4px;
      width: 400px;
      padding: 12px;
      padding-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }

    .cartridge-toast.marketplace .image-container {
      display: flex;
      padding: 3px;
      align-items: center;
      gap: 10px;
      border-radius: 4px;
      background: #161A17;
    }

    .cartridge-toast.marketplace .image-content-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cartridge-toast.marketplace .image {
      display: flex;
      width: 34px;
      height: 34px;
      padding: 2px;
      justify-content: center;
      align-items: center;
      aspect-ratio: 1/1;
      border-radius: 2px;
      background: #000;
      flex-shrink: 0;
    }

    .cartridge-toast.marketplace .content {
      display: flex;
      height: 40px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 2px;
    }

    .cartridge-toast.marketplace .title {
      color: #FFF;
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px; /* 142.857% */
    }

    .cartridge-toast.marketplace .item-name {
    color: #808080;
    text-align: center;
    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px; /* 133.333% */
    }

    .cartridge-toast.marketplace .close-button-container {
      display: flex;
      padding: 4px;
      align-items: center;
      gap: 10px;
    }
  `;
  targetDoc.head.appendChild(style);
}

// Create marketplace toast element
export function createMarketplaceToast(
  options: MarketplaceToastOptions,
): HTMLElement {
  const toast = document.createElement("div");
  toast.className = "cartridge-toast marketplace";

  const imageContentContainer = document.createElement("div");
  imageContentContainer.className = "image-content-container";

  const imageContainer = document.createElement("div");
  imageContainer.className = "image-container";

  const image = document.createElement("img");
  image.className = "image";
  image.src = sanitizeImageSrc(options.itemImages[0]);
  image.alt = options.itemNames[0];
  imageContainer.appendChild(image);

  const content = document.createElement("div");
  content.className = "content";

  const actionText = {
    purchased: "Purchased!",
    sold: "Sold!",
    sent: "Sent!",
    listed: "Listed!",
    unlisted: "Unlisted!",
  };

  const title = document.createElement("p");
  title.className = "title";
  title.textContent = actionText[options.action];

  const itemName = document.createElement("p");
  itemName.className = "item-name";
  itemName.textContent = options.itemNames[0];

  content.appendChild(title);
  content.appendChild(itemName);

  imageContentContainer.appendChild(imageContainer);
  imageContentContainer.appendChild(content);

  const closeButtonContainer = document.createElement("div");
  closeButtonContainer.className = "close-button-container";
  const closeButton = CloseButton(false);
  closeButtonContainer.appendChild(closeButton);

  toast.appendChild(imageContentContainer);
  toast.appendChild(closeButtonContainer);

  return toast;
}
