import { css } from "@emotion/css";

const iframeCss = css`
  min-height: 600px;
  min-width: 400px;
  border: none;
  border-radius: 8px;
  @media only screen and (max-width: 600px) {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
`;

const containerCss = css`
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  zindex: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
`;

export const createModal = (src: string, onClose?: () => void) => {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.id = "cartridge-modal";
  iframe.className = iframeCss;
  iframe.sandbox.add("allow-forms");
  iframe.sandbox.add("allow-popups");
  iframe.sandbox.add("allow-scripts");
  iframe.sandbox.add("allow-same-origin");
  iframe.allow = "publickey-credentials-get *";
  if (!!document.hasStorageAccess) {
    iframe.sandbox.add("allow-storage-access-by-user-activation");
  }

  const container = document.createElement("div");
  container.className = containerCss;
  container.appendChild(iframe);

  const open = () => {
    container.style.display = "flex";
  };

  const close = () => {
    if (onClose) {
      onClose();
    }

    container.style.display = "none";
  };

  container.onclick = () => close();

  return {
    element: container,
    open,
    close,
  };
};
