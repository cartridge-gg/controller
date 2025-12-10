import { TOAST_CONTAINER_ID } from "./utils";

// Inject CSS styles if not already present
export function injectStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-styles";
  style.textContent = getCommonStyles();
  targetDoc.head.appendChild(style);
}

function getCommonStyles(): string {
  return `
    #${TOAST_CONTAINER_ID} {
      position: fixed;
      z-index: 999999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
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
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      animation: cartridge-toast-slide-in 0.3s ease-out;
      overflow: hidden;
      pointer-events: auto;
    }

    #${TOAST_CONTAINER_ID}.top-right .cartridge-toast,
    #${TOAST_CONTAINER_ID}.bottom-right .cartridge-toast {
      align-self: flex-end;
    }

    #${TOAST_CONTAINER_ID}.top-left .cartridge-toast,
    #${TOAST_CONTAINER_ID}.bottom-left .cartridge-toast {
      align-self: flex-start;
    }

    #${TOAST_CONTAINER_ID}.top-center .cartridge-toast,
    #${TOAST_CONTAINER_ID}.bottom-center .cartridge-toast {
      align-self: center;
    }

    @keyframes cartridge-toast-slide-in {
      from {
        opacity: 0;
        transform: translateY(10px);
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
        transform: translateY(10px);
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
}
