export const CloseButton = (translucent = false): HTMLDivElement => {
  const container = document.createElement("div");
  container.id = "close-button";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";

  const button = document.createElement("button");
  button.className = translucent
    ? "cartridge-close-button translucent"
    : "cartridge-close-button";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "none");
  svg.style.pointerEvents = "none"; // Ensure clicks pass through to button

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M15.5465 14.343C15.8881 14.6837 15.8881 15.2364 15.5465 15.5772C15.2049 15.9179 14.6506 15.9178 14.309 15.5772L10.0006 11.2484L5.66162 15.5757C5.32001 15.9164 4.76575 15.9164 4.4241 15.5757C4.08245 15.235 4.08249 14.6822 4.4241 14.3415L8.76455 10.0157L4.4229 5.65573C4.08128 5.31504 4.08128 4.76227 4.4229 4.42155C4.76451 4.08082 5.31877 4.08086 5.66042 4.42155L10.0006 8.78299L14.3396 4.45573C14.6812 4.11504 15.2355 4.11504 15.5771 4.45573C15.9188 4.79642 15.9187 5.34918 15.5771 5.68991L11.2367 10.0157L15.5465 14.343Z",
  );
  path.setAttribute("class", "cartridge-close-icon");

  svg.appendChild(path);
  button.appendChild(svg);

  // Inline critical button styles
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.border = "none";
  button.style.background = "transparent";
  button.style.cursor = "pointer";
  button.style.borderRadius = "4px";
  button.style.padding = "10px";
  button.style.gap = "4px";
  button.style.transition = "background-color 0.2s ease";

  // Add styles dynamically to the correct document
  const targetDoc = container.ownerDocument;
  if (!targetDoc.getElementById("cartridge-close-button-style")) {
    const style = targetDoc.createElement("style");
    style.id = "cartridge-close-button-style";
    style.textContent = `
      .cartridge-close-button .cartridge-close-icon {
        fill: rgba(0, 0, 0, 0.48);
        transition: fill 0.2s ease;
      }

      .cartridge-close-button:not(.translucent):hover {
        background-color: #181c19;
      }

      .cartridge-close-button:not(.translucent):hover .cartridge-close-icon {
        fill: rgba(255, 255, 255, 0.72);
      }

      .cartridge-close-button.translucent .cartridge-close-icon {
        fill: rgba(0, 0, 0, 0.48);
      }

      .cartridge-close-button.translucent:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .cartridge-close-button.translucent:hover .cartridge-close-icon {
        fill: rgba(0, 0, 0, 0.72);
      }

      .cartridge-close-button:active {
        transform: scale(0.95);
      }
    `;
    targetDoc.head.appendChild(style);
  }

  container.appendChild(button);
  return container;
};
