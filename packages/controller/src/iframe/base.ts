import { AsyncMethodReturns, connectToChild } from "@cartridge/penpal";
import { ControllerOptions, Modal } from "../types";

export type IFrameOptions<CallSender> = Omit<
  ConstructorParameters<typeof IFrame>[0],
  "id" | "url" | "onConnect"
> & {
  url?: string;
  onConnect: (child: AsyncMethodReturns<CallSender>) => void;
};

export class IFrame<CallSender extends {}> implements Modal {
  url?: URL;
  private iframe?: HTMLIFrameElement;
  private container?: HTMLDivElement;
  private iframeContainer?: HTMLDivElement;
  private loadingScreen?: HTMLDivElement;
  private onClose?: () => void;
  private isLoaded: boolean = false;
  private loadPromise?: Promise<void>;

  constructor({
    id,
    url,
    preset,
    theme,
    colorMode,
    onClose,
    onConnect,
    methods = {},
  }: Pick<ControllerOptions, "theme" | "preset" | "colorMode"> & {
    id: string;
    url: URL;
    onClose?: () => void;
    onConnect: (child: AsyncMethodReturns<CallSender>) => void;
    methods?: { [key: string]: (...args: any[]) => void };
  }) {
    if (typeof document === "undefined") {
      return;
    }

    if (theme) {
      url.searchParams.set("theme", theme);
    }

    if (preset) {
      url.searchParams.set("preset", preset);
    }

    if (colorMode) {
      url.searchParams.set("colorMode", colorMode);
    }

    this.url = url;

    const iframe = document.createElement("iframe");
    iframe.src = url.toString();
    iframe.id = id;
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.transition = "opacity 0.2s ease";
    iframe.sandbox.add("allow-forms");
    iframe.sandbox.add("allow-popups");
    iframe.sandbox.add("allow-scripts");
    iframe.sandbox.add("allow-same-origin");
    iframe.allow =
      "publickey-credentials-create *; publickey-credentials-get *; clipboard-write";
    if (!!document.hasStorageAccess) {
      iframe.sandbox.add("allow-storage-access-by-user-activation");
    }

    const loadingScreen = document.createElement("div");
    loadingScreen.style.position = "absolute";
    loadingScreen.style.top = "0";
    loadingScreen.style.left = "0";
    loadingScreen.style.width = "100%";
    loadingScreen.style.height = "100%";
    loadingScreen.style.display = "flex";
    loadingScreen.style.alignItems = "center";
    loadingScreen.style.justifyContent = "center";
    loadingScreen.style.borderRadius = "8px";
    loadingScreen.innerHTML = `
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; 
      border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;">
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    const iframeContainer = document.createElement("div");
    iframeContainer.style.position = "relative";
    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(loadingScreen);

    const container = document.createElement("div");
    container.id = "controller";
    container.style.position = "fixed";
    container.style.height = "100%";
    container.style.width = "100%";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "10000";
    container.style.backgroundColor = "rgba(0,0,0,0.6)";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.visibility = "hidden";
    container.style.opacity = "0";
    container.style.transition = "opacity 0.2s ease";
    container.appendChild(iframeContainer);

    this.iframe = iframe;
    this.container = container;
    this.iframeContainer = iframeContainer;
    this.loadingScreen = loadingScreen;

    connectToChild<CallSender>({
      iframe: this.iframe,
      methods: { close: () => this.close(), ...methods },
    }).promise.then(onConnect);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    const observer = new MutationObserver(() => {
      const existingController = document.getElementById("controller");
      if (document.body) {
        if (
          (id === "controller-keychain" && !existingController) ||
          id === "controller-profile"
        ) {
          document.body.appendChild(container);
          observer.disconnect();
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const existingController = document.getElementById("controller");
    if (document.body) {
      if (
        (id === "controller-keychain" && !existingController) ||
        id === "controller-profile"
      ) {
        document.body.appendChild(container);
      }
    }

    this.onClose = onClose;

    this.loadPromise = new Promise((resolve) => {
      iframe.addEventListener("load", () => {
        // this.isLoaded = true;
        // iframe.style.opacity = "1";
        // loadingScreen.style.display = "none";
        resolve();
      });
    });
  }

  open() {
    if (!this.container) return;
    document.body.style.overflow = "hidden";

    this.container.style.visibility = "visible";
    this.container.style.opacity = "1";
  }

  close() {
    if (!this.container) return;
    this.onClose?.();

    document.body.style.overflow = "auto";

    this.container.style.visibility = "hidden";
    this.container.style.opacity = "0";
  }

  sendBackward() {
    if (!this.container) return;
    this.container.style.zIndex = "9999";
  }

  sendForward() {
    if (!this.container) return;
    this.container.style.zIndex = "10000";
  }

  private resize() {
    if (!this.iframe || !this.iframeContainer) return;

    this.iframe.style.userSelect = "none";
    this.iframe.style.height = "100%";
    this.iframe.style.width = "100%";

    if (window.innerWidth < 768) {
      this.iframe.style.borderRadius = "0";
      this.iframeContainer.style.height = "100%";
      this.iframeContainer.style.width = "100%";
      if (this.loadingScreen) {
        this.loadingScreen.style.borderRadius = "0";
      }
      return;
    }

    this.iframe.style.borderRadius = "8px";
    this.iframeContainer.style.height = "600px";
    this.iframeContainer.style.width = "432px";
    if (this.loadingScreen) {
      this.loadingScreen.style.borderRadius = "8px";
    }
  }

  async waitForLoad(timeout: number = 5000): Promise<void> {
    if (this.isLoaded) return;

    if (!this.loadPromise) {
      throw new Error("IFrame not properly initialized");
    }

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(
        () => reject(new Error("Timeout waiting for iframe to load")),
        timeout,
      );
    });

    return Promise.race([this.loadPromise, timeoutPromise]);
  }
}
