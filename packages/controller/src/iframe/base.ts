import { AsyncMethodReturns, connectToChild } from "@cartridge/penpal";
import { defaultPresets } from "../presets";
import { ControllerOptions, Modal } from "../types";

export type IFrameOptions<CallSender> = Omit<
  ConstructorParameters<typeof IFrame>[0],
  "id" | "url" | "onConnect"
> & {
  url?: string;
  onConnect: (child: AsyncMethodReturns<CallSender>) => void;
};

export class IFrame<CallSender extends {}> implements Modal {
  private iframe?: HTMLIFrameElement;
  private container?: HTMLDivElement;
  private onClose?: () => void;

  constructor({
    id,
    url,
    theme,
    config,
    colorMode,
    onClose,
    onConnect,
  }: Pick<ControllerOptions, "theme" | "config" | "colorMode"> & {
    id: string;
    url: URL;
    onClose?: () => void;
    onConnect: (child: AsyncMethodReturns<CallSender>) => void;
  }) {
    if (typeof document === "undefined") {
      return;
    }

    url.searchParams.set(
      "theme",
      encodeURIComponent(
        JSON.stringify(
          config?.presets?.[theme ?? "cartridge"] ?? defaultPresets.cartridge,
        ),
      ),
    );

    if (colorMode) {
      url.searchParams.set("colorMode", colorMode);
    }

    const iframe = document.createElement("iframe");
    iframe.src = url.toString();
    iframe.id = id;
    iframe.style.border = "none";
    iframe.sandbox.add("allow-forms");
    iframe.sandbox.add("allow-popups");
    iframe.sandbox.add("allow-scripts");
    iframe.sandbox.add("allow-same-origin");
    iframe.allow =
      "publickey-credentials-create *; publickey-credentials-get *; clipboard-write";
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
    container.style.backgroundColor = "rgba(0,0,0,0.6)";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.visibility = "hidden";
    container.style.opacity = "0";
    container.style.transition = "opacity 0.2s ease";
    container.appendChild(iframe);

    this.iframe = iframe;
    this.container = container;

    connectToChild<CallSender>({
      iframe: this.iframe,
      methods: { close: () => this.close() },
    }).promise.then(onConnect);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      this.append();
    } else {
      document.addEventListener("DOMContentLoaded", this.append);
    }

    this.onClose = onClose;
  }

  currentUrl() {
    return this.iframe ? new URL(this.iframe.src) : undefined;
  }

  updateUrl(url: URL) {
    if (!this.iframe) return;
    this.iframe.src = url.toString();
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

  private append() {
    if (!this.container) return;
    document.body.appendChild(this.container);
  }

  private resize() {
    if (!this.iframe) return;
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
