export const createModal = (src: string, onClose?: () => void) => {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.id = "cartridge-modal";
  iframe.style.border = "none";
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

  resize(iframe);
  window.addEventListener("resize", () => resize(iframe));

  return {
    element: container,
    open,
    close,
  };
};

const resize = (el: HTMLElement) => {
  if (window.innerWidth < 600) {
    el.style.height = "100%";
    el.style.width = "100%";
    el.style.borderRadius = "0";
    return;
  }

  el.style.height = "600px";
  el.style.width = "400px";
  el.style.borderRadius = "8px";
};
