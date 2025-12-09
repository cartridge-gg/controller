import { QuestToastOptions } from "../types";
import { CloseButton } from "../components/close-button";

// Inject quest toast specific styles
export function injectQuestStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-quest-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-quest-styles";
  style.textContent = `
    /* Quest Toast */
    .cartridge-toast.quest {
      background-color: #161A17;
      border-radius: 8px;
      width: 360px;
      padding: 12px;
      padding-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      min-height: 52px;
      box-sizing: border-box;
    }

    .cartridge-toast.quest .image-content-container {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .cartridge-toast.quest .image {
      width: 30px;
      height: 30px;
      aspect-ratio: 1/1;
    }

    .cartridge-toast.quest .image-container {
      display: flex;
      padding: 5px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      border-radius: 4px;
      background: #161A17;
    }

    .cartridge-toast.quest .content {
      display: flex;
      height: 40px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 2px;
    }

    .cartridge-toast.quest .title {
      color: #FFF;
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }

    .cartridge-toast.quest .subtitle {
      color: #808080;
      font-family: Inter;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }

    .cartridge-toast.quest .xp-section-container {
      display: flex;
      padding: 10px;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .cartridge-toast.quest .xp-section {
      display: flex;
      align-items: center;
      gap: 2px;
      align-self: stretch;
    }

    .cartridge-toast.quest .xp-section .xp-icon {
      width: 20px;
      height: 20px;
      aspect-ratio: 1/1;
    }

    .cartridge-toast.quest .xp-section .xp-amount {
      color: #FFF;
      /* Inter/Regular 14px */
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px; /* 142.857% */
    }
  `;
  targetDoc.head.appendChild(style);
}

// Create quest toast element
export function createQuestToast(options: QuestToastOptions): HTMLElement {
  const toast = document.createElement("div");
  toast.className = "cartridge-toast quest";

  const imageContentContainer = document.createElement("div");
  imageContentContainer.className = "image-content-container";

  const imageContainer = document.createElement("div");
  imageContainer.className = "image-container";

  const icon = getQuestIcon();
  icon.className = "image";
  imageContainer.appendChild(icon);

  const content = document.createElement("div");
  content.className = "content";

  const title = document.createElement("p");
  title.className = "title";
  title.textContent = options.title;

  const subtitle = document.createElement("p");
  subtitle.className = "subtitle";
  subtitle.textContent = options.subtitle || "Earned!";

  content.appendChild(title);
  content.appendChild(subtitle);

  imageContentContainer.appendChild(imageContainer);
  imageContentContainer.appendChild(content);

  const closeButton = CloseButton(false);

  toast.appendChild(imageContentContainer);
  toast.appendChild(closeButton);

  return toast;
}

const getQuestIcon = () => {
  const container = document.createElement("div");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "34");
  svg.setAttribute("height", "34");
  svg.setAttribute("viewBox", "0 0 30 30");
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.innerHTML = `<path d="M3 6.5V8C3 8.55312 3.44687 9 4 9H4.5H6V6.5C6 5.67188 5.32812 5 4.5 5C3.67188 5 3 5.67188 3 6.5ZM6.5 5C6.8125 5.41875 7 5.9375 7 6.5V16C7 17.1031 7.89687 18 9 18C10.1031 18 11 17.1031 11 16V15.8344C11 14.8219 11.8219 14 12.8344 14H18V8C18 6.34375 16.6562 5 15 5H6.5ZM17.5 19C19.4344 19 21 17.4344 21 15.5C21 15.225 20.775 15 20.5 15H12.8344C12.375 15 12 15.3719 12 15.8344V16C12 17.6562 10.6562 19 9 19H14.5H17.5Z" fill="white"/>`;
  container.appendChild(svg);
  return container;
};
