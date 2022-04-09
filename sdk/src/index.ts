import cuid from "cuid";
import { Account } from "./account";
import { Message, Messenger } from "./messenger";
import { ConnectRequest, ConnectResponse, ProbeResponse, Scope } from "./types";

export class Cartridge {
  private selector = "cartridge-messenger";
  private messenger?: Messenger;
  private scopes: Scope[] = [];
  private baseUrl: string = "https://cartridge.gg";
  private targetOrigin: string = "https://cartridge.gg";

  constructor(
    scopes?: Scope[],
    options?: {
      baseUrl?: string;
      targetOrigin?: string;
    }
  ) {
    if (scopes) {
      this.scopes = scopes;
    }

    if (options?.baseUrl) {
      this.baseUrl = options.baseUrl;
    }

    if (options?.targetOrigin) {
      this.targetOrigin = options.targetOrigin;
    }

    if (typeof document !== "undefined" && !this.messenger) {
      let iframe = document.getElementById(this.selector) as HTMLIFrameElement;
      if (!!iframe) {
        if (!this.messenger) {
          this.messenger = new Messenger(
            iframe.contentWindow,
            this.targetOrigin
          );
        }
        return;
      }

      iframe = document.createElement("iframe");
      iframe.id = this.selector;
      iframe.src = `${this.baseUrl}/wallet/iframe`;
      iframe.style.setProperty("display", "none");
      document.body.appendChild(iframe);
      this.messenger = new Messenger(iframe.contentWindow, this.targetOrigin);
    }
  }

  async connect() {
    const prob = await this.messenger.send<ProbeResponse>({
      method: "probe",
    });

    if (prob.result?.address) {
      return new Account(prob.result.address, this.messenger);
    }

    const id = cuid();

    window.open(
      `${this.baseUrl}/wallet/connect?origin=${encodeURIComponent(
        window.origin
      )}&id=${id}&scopes=${encodeURIComponent(JSON.stringify(this.scopes))}`,
      "_blank",
      "height=600,width=400"
    );

    const response = await this.messenger.send<ConnectResponse>({
      method: "connect",
      params: {
        id,
        scopes: this.scopes,
      },
    } as ConnectRequest);

    return new Account(response.result.address, this.messenger);
  }
}

export { Message, Messenger };
export * from "./types";
