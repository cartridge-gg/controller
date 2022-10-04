import qs from "query-string";
import { AccountInterface } from "starknet";
import { AsyncMethodReturns, CallSender, Connection, connectToChild } from '@cartridge/penpal';

import Account from "./account";
import { Keychain, Scope } from "./types";

class Controller {
  private selector = "cartridge-messenger";
  private connection?: Connection<Keychain>;
  private keychain?: AsyncMethodReturns<Keychain>;
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

    if (typeof document === "undefined") {
      return
    }

    const iframe = document.createElement("iframe");
    iframe.id = this.selector;
    iframe.src = this.url;
    iframe.style.opacity = "0";
    iframe.style.height = "0";
    iframe.style.width = "0";
    iframe.sandbox.add("allow-scripts")
    iframe.sandbox.add("allow-same-origin")

    if (!!document.hasStorageAccess) {
      iframe.sandbox.add("allow-storage-access-by-user-activation")
    }

    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      document.body.appendChild(iframe);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(iframe);
      });
    }

    this.connection = connectToChild<Keychain>({
      iframe,
      debug: true,
    })

    this.connection.promise.then((keychain) =>
      this.keychain = keychain
    ).then(() => this.probe())
  }

  async ready() {
    return this.connection?.promise.then(() => this.probe()).then((res) => !!res, () => false)
  }

  async probe() {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    try {
      const { address, scopes } = await this.keychain.probe();
      this.account = new Account(
        address,
        scopes,
        this.keychain,
        {
          url: this.url,
        }
      );
    } catch (e) {
      console.error(e)
    }

    return !!this.account;
  }

  // Register a new device key.
  async register(username: string, credential: { x: string, y: string }) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    try {
      return await this.keychain.register(username, credential)
    } catch (e) {
      console.error(e)
    }
  }

  async connect() {
    if (this.account) {
      return this.account;
    }

    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess()
      if (!ok) {
        await document.requestStorageAccess()
      }
    }

    window.open(
      `${this.url}/connect?${qs.stringify({
        origin: window.origin,
        scopes: JSON.stringify(this.scopes),
      })}`,
      "_blank",
      "height=650,width=400"
    );

    const response = await this.keychain.connect(this.scopes);

    this.account = new Account(
      response.address,
      response.scopes,
      this.keychain,
      {
        url: this.url,
      }
    );

    return this.account;
  }

  async disconnect() {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess()
      if (!ok) {
        await document.requestStorageAccess()
      }
    }

    return await this.keychain.disconnect();
  }
}

export default Controller;
export * from "./types";
export * from "./errors";
