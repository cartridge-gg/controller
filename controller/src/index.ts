import cuid from "cuid";
import qs from "query-string";
import { AccountInterface } from "starknet";
import { BigNumberish } from "starknet/utils/number";

import Account from "./account";
import Messenger, { Message } from "./messenger";
import { ConnectRequest, ConnectResponse, ProbeResponse, RegisterRequest, RegisterResponse, Scope } from "./types";

class Controller {
  private selector = "cartridge-messenger";
  private messenger?: Messenger;
  private scopes: Scope[] = [];
  private url: string = "https://x.cartridge.gg";
  private loading = true;
  private ready_: Promise<boolean> | undefined;
  private account: AccountInterface | undefined;

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
          this.messenger = new Messenger(iframe.contentWindow, this.url);
        }
      } else {
        iframe = document.createElement("iframe");
        iframe.id = this.selector;
        iframe.src = `${this.url}`;
        iframe.style.opacity = "0";
        iframe.style.height = "0";
        iframe.style.width = "0";
        iframe.sandbox.add("allow-scripts")
        iframe.sandbox.add("allow-same-origin")

        if (!!document.hasStorageAccess) {
          iframe.sandbox.add("allow-storage-access-by-user-activation")
        }

        document.body.appendChild(iframe);
        this.messenger = new Messenger(iframe.contentWindow, this.url);
      }
    }
  }

  async ready() {
    if (!this.loading) return Promise.resolve(true);
    return this.ready_;
  }

  async probe() {
    const probe = await this.messenger?.send<ProbeResponse>({
      method: "probe",
    });

    if (this.messenger && probe?.result?.address) {
      this.account = new Account(
        probe.result.address,
        probe.result.scopes,
        this.messenger,
        {
          url: this.url,
        }
      );

      return this.account;
    }
  }

  // Register a new device key.
  async register(username: string, credential: { x: BigNumberish, y: BigNumberish }) {
    const register = await this.messenger?.send<RegisterResponse>({
      method: "register",
      params: {
        username,
        credential
      }
    } as RegisterRequest);

    if (!register || register.error) {
      throw new Error("registration error")
    }

    return register.result
  }

  async connect() {
    const id = cuid();

    if (this.account) {
      return this.account;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess()
      if (!ok) {
        await document.requestStorageAccess()
      }
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

    const response = await this.messenger?.send<ConnectResponse>({
      method: "connect",
      params: {
        id,
        scopes: this.scopes,
      },
    } as ConnectRequest);

    if (!this.messenger || !response || response.error || !response.result) {
      console.error("not ready for connect")
      return null;
    }

    this.account = new Account(
      response.result.address!,
      response.result.scopes,
      this.messenger,
      {
        url: this.url,
      }
    );

    return this.account;
  }
}

export default Controller;
export type { Message };
export { Messenger };
export * from "./types";
