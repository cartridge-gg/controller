import cuid from "cuid";
import { Account } from "./account";
import { Message, Messenger } from "./messenger";
import { ConnectRequest, ConnectResponse, ProbeResponse, Scope } from "./types";

export class Cartridge {
  private selector = "cartridge-messenger";
  private messenger?: Messenger;
  private scopes: Scope[] = [];

  target = "process.env.BASE_URL/wallet/iframe";

  constructor(scopes?: Scope[]) {
    if (scopes) {
      this.scopes = scopes;
    }

    if (typeof document !== "undefined" && !this.messenger) {
      let iframe = document.getElementById(this.selector) as HTMLIFrameElement;
      if (!!iframe) {
        if (!this.messenger) {
          this.messenger = new Messenger(iframe.contentWindow);
        }
        return;
      }

      iframe = document.createElement("iframe");
      iframe.id = this.selector;
      iframe.src = this.target;
      iframe.style.setProperty("display", "none");
      document.body.appendChild(iframe);
      this.messenger = new Messenger(iframe.contentWindow);
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
      `process.env.BASE_URL/wallet/connect?origin=${encodeURIComponent(
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
