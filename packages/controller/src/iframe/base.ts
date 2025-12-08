import { AsyncMethodReturns, connectToChild } from "@cartridge/penpal";
import { Modal } from "../types";

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
  private onClose?: () => void;
  private closeTimeout?: NodeJS.Timeout;

  constructor({
    id,
    url,
    onClose,
    onConnect,
    methods = {},
  }: {
    id: string;
    url: URL;
    onClose?: () => void;
    onConnect: (child: AsyncMethodReturns<CallSender>) => void;
    methods?: { [key: string]: (...args: any[]) => void };
  }) {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    this.url = url;

    const docHead = document.head;

    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.id = "controller-viewport";
    meta.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-content";
    docHead.appendChild(meta);

    const iframe = document.createElement("iframe");
    iframe.src = url.toString();
    iframe.id = id;
    iframe.style.border = "none";
    iframe.sandbox.add("allow-forms");
    iframe.sandbox.add("allow-popups");
    iframe.sandbox.add("allow-popups-to-escape-sandbox");
    iframe.sandbox.add("allow-scripts");
    iframe.sandbox.add("allow-same-origin");
    iframe.allow =
      "publickey-credentials-create *; publickey-credentials-get *; clipboard-write; local-network-access *; payment *";
    iframe.style.scrollbarWidth = "none";
    iframe.style.setProperty("-ms-overflow-style", "none");
    iframe.style.setProperty("-webkit-scrollbar", "none");
    // Enable Storage Access API for the iframe
    // This allows the keychain iframe to request access to its first-party storage
    // when embedded in third-party contexts (other games/apps)
    if (!!document.hasStorageAccess) {
      iframe.sandbox.add("allow-storage-access-by-user-activation");
    }

    const container = document.createElement("div");
    container.id = "controller";
    container.style.position = "fixed";
    container.style.height = "100%";
    container.style.width = "100%";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "10000";
    container.style.backgroundColor = "rgba(0,0,0,0.6)";
    container.style.display = "none"; // Use display: none to completely hide from password managers
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.transition = "opacity 0.2s ease";
    container.style.opacity = "0";
    container.style.pointerEvents = "auto";
    container.style.overscrollBehaviorY = "contain";
    container.style.scrollbarWidth = "none";
    container.style.setProperty("-ms-overflow-style", "none");
    container.style.setProperty("-webkit-scrollbar", "none");
    container.appendChild(iframe);

    // Disables pinch to zoom
    container.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    container.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    container.addEventListener(
      "touchend",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    this.iframe = iframe;
    this.container = container;

    connectToChild<CallSender>({
      iframe: this.iframe,
      methods: {
        close: (_origin: string) => () => this.close(),
        reload: (_origin: string) => () => window.location.reload(),
        ...methods,
      },
    }).promise.then(onConnect);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    const observer = new MutationObserver(() => {
      if (typeof document === "undefined") return;
      const existingController = document.getElementById("controller");
      if (document.body) {
        if (id === "controller-keychain" && !existingController) {
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
      if (id === "controller-keychain" && !existingController) {
        document.body.appendChild(container);
      }
    }

    this.onClose = onClose;
  }

  open() {
    if (!this.container || typeof document === "undefined" || !document.body)
      return;

    // Clear any pending close timeout to prevent race condition
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }

    document.body.style.overflow = "hidden";

    this.container.style.display = "flex";
    // Use requestAnimationFrame to ensure display change is processed before opacity change
    requestAnimationFrame(() => {
      if (this.container) {
        this.container.style.opacity = "1";
      }
    });
  }

  close() {
    if (!this.container || typeof document === "undefined" || !document.body)
      return;
    this.onClose?.();

    document.body.style.overflow = "auto";

    // Start fade-out transition
    this.container.style.opacity = "0";

    // Set display: none after transition completes (200ms)
    this.closeTimeout = setTimeout(() => {
      if (this.container) {
        this.container.style.display = "none";
      }
      this.closeTimeout = undefined;
    }, 200);
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
    if (!this.iframe || typeof window === "undefined") return;

    this.iframe.style.userSelect = "none";

    if (window.innerWidth < 768) {
      this.iframe.style.height = "100%";
      this.iframe.style.width = "100%";
      this.iframe.style.borderRadius = "0";
      return;
    }

    this.iframe.style.height = "600px";
    this.iframe.style.width = "432px";
    this.iframe.style.borderRadius = "8px";
  }

  isOpen() {
    return this.container?.style.display !== "none";
  }
}
