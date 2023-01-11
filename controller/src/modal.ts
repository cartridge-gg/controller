import { connectToChild } from "@cartridge/penpal";
import { ModalMethods } from "./types";

export interface Modal {
  open: (src: string) => void;
  close: () => void;
}

export const createModal = (): Modal => {
  const iframe = document.createElement("iframe");
  iframe.id = "cartridge-modal";
  iframe.style.minHeight = "600px";
  iframe.style.minWidth = "400px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "8px";
  iframe.sandbox.add("allow-forms");
  iframe.sandbox.add("allow-popups");
  iframe.sandbox.add("allow-scripts");
  iframe.sandbox.add("allow-same-origin");
  iframe.allow = "publickey-credentials-get *";
  if (!!document.hasStorageAccess) {
    iframe.sandbox.add("allow-storage-access-by-user-activation");
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.height = "100%";
  container.style.width = "100%";
  container.style.top = "0";
  container.style.left = "0";
  container.style.zIndex = "10000";
  container.style.backgroundColor = "rgba(0,0,0,0.5)";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.display = "none";
  container.appendChild(iframe);
  document.body.appendChild(container);

  function open(src: string) {
    container.style.display = "flex";
    iframe.src = src;
    connectToChild<ModalMethods>({
      iframe,
      methods: {
        onCancel: () => {
          close();
        },
        onConfirm: () => {
          close();
        },
      },
    });
  }

  function close() {
    container.style.display = "none";
    iframe.src = "about:blank";
  }

  return {
    open,
    close,
  };
};
