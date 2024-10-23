import { Policy } from "@cartridge/controller";
import { ec, stark, WalletAccount } from "starknet";

import SessionAccount from "./account";
import { KEYCHAIN_URL } from "src/constants";
import BaseProvider from "src/provider";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

export default class SessionProvider extends BaseProvider {
  protected _chainId: string;
  protected backend: UnifiedBackend;

  protected _username?: string;
  protected _redirectUrl: string;
  protected _policies: Policy[];
  public account?: SessionAccount;

  constructor({
    rpc,
    chainId,
    policies,
    backend,
    redirectUrl,
  }: {
    rpc: string;
    chainId: string;
    policies: Policy[];
    redirectUrl: string;
    backend: UnifiedBackend;
  }) {
    super({ policies, rpc });

    this.backend = backend;
    this._chainId = chainId;
    this._redirectUrl = redirectUrl;
    this._policies = policies;
  }

  async chainId() {
    return Promise.resolve(BigInt(this._chainId));
  }

  async username() {
    await this.tryRetrieveFromQueryOrStorage();
    return this._username;
  }

  async probe(): Promise<WalletAccount | undefined> {
    await this.tryRetrieveFromQueryOrStorage();
    return;
  }

  async connect(): Promise<WalletAccount | undefined> {
    await this.tryRetrieveFromQueryOrStorage();
    if (this.account) {
      return;
    }

    // Generate a random local key pair
    const pk = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(pk);

    this.backend.set(
      "sessionSigner",
      JSON.stringify({
        privKey: pk,
        pubKey: publicKey,
      }),
    );

    const url = `${KEYCHAIN_URL}/session?public_key=${publicKey}&redirect_uri=${
      this._redirectUrl
    }&redirect_query_name=startapp&policies=${JSON.stringify(
      this._policies,
    )}&rpc_url=${this.rpc}`;

    localStorage.setItem("lastUsedConnector", this.id);
    this.backend.openLink(url);

    return;
  }

  disconnect(): Promise<void> {
    this.backend.delete("sessionSigner");
    this.backend.delete("session");
    this.account = undefined;
    this._username = undefined;
    return Promise.resolve();
  }

  async tryRetrieveFromQueryOrStorage() {
    const signer = JSON.parse((await this.backend.get("sessionSigner"))!);
    let sessionRegistration: SessionRegistration | null = null;

    if (window.location.search.includes("startapp")) {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("startapp");
      if (session) {
        sessionRegistration = JSON.parse(atob(session));
        this.backend.set("session", JSON.stringify(sessionRegistration));

        // Remove the session query parameter
        params.delete("startapp");
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "") +
          window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    }

    if (!sessionRegistration) {
      const session = await this.backend.get("session");
      if (session) {
        sessionRegistration = JSON.parse(session);
      }
    }

    if (!sessionRegistration) {
      return;
    }

    this._username = sessionRegistration.username;
    this.account = new SessionAccount(this, {
      rpcUrl: this.rpc.toString(),
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: this._policies,
    });

    return this.account;
  }
}
