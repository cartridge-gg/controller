import cuid from "cuid";
import { Account } from "./account";
import { Message, Messenger } from "./messenger";
import { ConnectRequest, ConnectResponse, ProbeResponse, Scope } from "./types";
import qs from "query-string";
import { AccountInterface } from "starknet";

export class Cartridge {
  private selector = "cartridge-messenger";
  private messenger?: Messenger;
  private scopes: Scope[] = [];
  private url: string = "https://cartridge.gg";
  private origin: string = "https://cartridge.gg";
  private loading = true;
  private ready_: Promise<boolean>;
  private account: AccountInterface;

  constructor(
    scopes?: Scope[],
    options?: {
      url?: string;
      origin?: string;
    }
  ) {
    if (scopes) {
      this.scopes = scopes;
    }

    if (options?.url) {
      this.url = options.url;
    }

    if (options?.origin) {
      this.origin = options.origin;
    }

    if (typeof document !== "undefined") {
      this.ready_ = new Promise((resolve, reject) => {
        window.addEventListener("message", async (e) => {
          if (
            e.data.target === "cartridge" &&
            e.data.payload.method === "ready"
          ) {
            await this.probe();
            this.loading = false;
            resolve(true);
          }
        });
      });
    }

    if (typeof document !== "undefined" && !this.messenger) {
      let iframe = document.getElementById(this.selector) as HTMLIFrameElement;
      if (!!iframe) {
        if (!this.messenger) {
          this.messenger = new Messenger(iframe.contentWindow, this.origin);
        }
      } else {
        iframe = document.createElement("iframe");
        iframe.id = this.selector;
        iframe.src = `${this.url}/iframe`;
        iframe.style.setProperty("display", "none");
        document.body.appendChild(iframe);
        this.messenger = new Messenger(iframe.contentWindow, this.origin);
      }
    }
  }

  async ready() {
    if (!this.loading) return Promise.resolve(true);
    return this.ready_;
  }

  async probe() {
    const prob = await this.messenger.send<ProbeResponse>({
      method: "probe",
    });

    if (prob.result?.address) {
      this.account = new Account(
        prob.result.address,
        prob.result.scopes,
        this.messenger,
        {
          url: this.url,
        }
      );

      return this.account;
    }
  }

  async connect() {
    const id = cuid();

    if (this.account) {
      return this.account;
    }

    window.open(
      `${this.url}/connect?${qs.stringify({
        id,
        origin: window.origin,
        scopes: JSON.stringify(this.scopes),
      })}`,
      "_blank",
      "height=650,width=400"
    );

    const response = await this.messenger.send<ConnectResponse>({
      method: "connect",
      params: {
        id,
        scopes: this.scopes,
      },
    } as ConnectRequest);

    this.account = new Account(
      response.result.address,
      response.result.scopes,
      this.messenger,
      {
        url: this.url,
      }
    );

    return this.account;
  }
}

export { Message, Messenger };
export * from "./types";
