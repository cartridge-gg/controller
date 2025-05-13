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
  private onClose?: () => void;

  constructor({
    id,
    url,
    preset,
    onClose,
    onConnect,
    methods = {},
  }: Pick<ControllerOptions, "preset"> & {
    id: string;
    url: URL;
    onClose?: () => void;
    onConnect: (child: AsyncMethodReturns<CallSender>) => void;
    methods?: { [key: string]: (...args: any[]) => void };
  }) {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    // Check if an iframe with this ID already exists
    let iframe = document.getElementById(id) as HTMLIFrameElement | null;
    let container = iframe?.parentElement as HTMLDivElement | null;

    if (preset) {
      url.searchParams.set("preset", preset);
    }

    this.url = url;

    if (!iframe || !container) {
      iframe = document.createElement("iframe");
      iframe.src = url.toString();
      iframe.id = id;
      iframe.style.border = "none";
      iframe.sandbox.add("allow-forms");
      iframe.sandbox.add("allow-popups");
      iframe.sandbox.add("allow-popups-to-escape-sandbox");
      iframe.sandbox.add("allow-scripts");
      iframe.sandbox.add("allow-same-origin");
      iframe.allow =
        "publickey-credentials-create *; publickey-credentials-get *; clipboard-write";
      if (!!document.hasStorageAccess) {
        iframe.sandbox.add("allow-storage-access-by-user-activation");
      }

      container = document.createElement("div");
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
      container.style.pointerEvents = "auto";
      container.appendChild(iframe);
    }

    this.iframe = iframe;
    this.container = container;

    connectToChild<CallSender>({
      iframe: this.iframe,
      methods: {
        close: (_origin: string) => () => this.close(),
        closeAll: (_origin: string) => () => {
          // Close all iframes
          const iframes = document.querySelectorAll(
            'iframe[id^="controller-"]',
          );
          iframes.forEach((iframeElement) => {
            const parentContainer = iframeElement.parentElement;
            if (parentContainer) {
              parentContainer.style.visibility = "hidden";
              parentContainer.style.opacity = "0";
            }
          });
          if (document.body) {
            document.body.style.overflow = "auto";
          }
        },
        reload: (_origin: string) => () => window.location.reload(),
        ...methods,
      },
    }).promise.then(onConnect);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Only set up the observer and append if the container is not already in the body.
    if (!container.parentElement || container.parentElement !== document.body) {
      const observer = new MutationObserver(() => {
        if (typeof document === "undefined") return;
        // Check if the specific container associated with this iframe instance is in the body
        if (document.body && !this.container?.parentElement && this.container) {
          if (
            (id === "controller-keychain" &&
              !document.getElementById("controller")) || // This condition might need refinement
            id === "controller-profile"
          ) {
            document.body.appendChild(this.container);
            observer.disconnect();
          }
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      // Initial append check, also ensuring this specific container isn't already there.
      const existingControllerContainerById =
        document.getElementById("controller");
      if (document.body && this.container && !this.container.parentElement) {
        if (
          (id === "controller-keychain" && !existingControllerContainerById) || // This condition might need refinement
          id === "controller-profile"
        ) {
          document.body.appendChild(this.container);
        }
      }
    }

    this.onClose = onClose;
  }

  open() {
    if (!this.container || typeof document === "undefined" || !document.body)
      return;
    document.body.style.overflow = "hidden";

    this.container.style.visibility = "visible";
    this.container.style.opacity = "1";
  }

  close() {
    if (!this.container || typeof document === "undefined" || !document.body)
      return;
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
}
