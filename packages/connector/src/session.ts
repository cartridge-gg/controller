import { Connector } from "@starknet-react/core";
import { Policy } from "@cartridge/controller";
import { icon } from "./icon";
import { ec, stark } from "starknet";
import SessionAccount from "@cartridge/controller/dist/session";
import { KEYCHAIN_URL } from "./constants";

/**
 * Represents a unified backend for storage operations and link handling.
 */
interface UnifiedBackend {
  /**
   * Retrieves the value associated with the specified key.
   * @param key - The key to look up in the storage.
   * @returns A promise that resolves to the stored value as a string, or null if the key doesn't exist.
   */
  get: (key: string) => Promise<string | null>;

  /**
   * Stores a key-value pair in the storage.
   * @param key - The key under which to store the value.
   * @param value - The value to be stored.
   * @returns A promise that resolves when the value has been successfully stored.
   */
  set: (key: string, value: string) => Promise<void>;

  /**
   * Removes the key-value pair associated with the specified key from the storage.
   * @param key - The key of the item to be removed.
   * @returns A promise that resolves when the item has been successfully removed.
   */
  delete: (key: string) => Promise<void>;

  /**
   * Opens the specified URL.
   * @param url - The URL to open.
   */
  openLink: (url: string) => void;
}

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

export default class SessionConnector extends Connector {
  private _chainId: string;
  private _backend: UnifiedBackend;
  private _rpcUrl: string;
  private _policies: Policy[];
  private _username?: string;
  private _redirectUrl: string;
  private _account?: SessionAccount;

  constructor({
    rpcUrl,
    chainId,
    policies,
    backend,
    redirectUrl,
  }: {
    rpcUrl: string;
    chainId: string;
    policies: Policy[];
    redirectUrl: string;
    backend: UnifiedBackend;
  }) {
    super();

    this._rpcUrl = rpcUrl;
    this._policies = policies;
    this._backend = backend;
    this._chainId = chainId;
    this._redirectUrl = redirectUrl;
  }

  readonly id = "session";

  readonly name = "Session";

  readonly icon = {
    dark: icon,
    light: icon,
  };

  async chainId() {
    return Promise.resolve(BigInt(this._chainId));
  }

  available(): boolean {
    return true;
  }

  ready(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async username() {
    await this.tryRetrieveFromQueryOrStorage();
    return this._username;
  }

  async connect() {
    await this.tryRetrieveFromQueryOrStorage();
    if (this._account) {
      return {
        account: this._account.address,
        chainId: await this.chainId(),
      };
    }

    // Generate a random local key pair
    const pk = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(pk);

    this._backend.set(
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
    )}&rpc_url=${this._rpcUrl}`;

    localStorage.setItem("lastUsedConnector", this.id);
    this._backend.openLink(url);

    return {
      account: "",
      chainId: await this.chainId(),
    };
  }

  disconnect(): Promise<void> {
    this._backend.delete("sessionSigner");
    this._backend.delete("session");
    this._account = undefined;
    this._username = undefined;
    return Promise.resolve();
  }

  async account() {
    await this.tryRetrieveFromQueryOrStorage();

    if (!this._account) {
      return Promise.reject("Session not registered");
    }

    return this._account;
  }

  async tryRetrieveFromQueryOrStorage() {
    const signer = JSON.parse((await this._backend.get("sessionSigner"))!);
    let sessionRegistration: SessionRegistration | null = null;

    if (window.location.search.includes("startapp")) {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("startapp");
      if (session) {
        sessionRegistration = JSON.parse(atob(session));
        this._backend.set("session", JSON.stringify(sessionRegistration));

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
      const session = await this._backend.get("session");
      if (session) {
        sessionRegistration = JSON.parse(session);
      }
    }

    if (!sessionRegistration) {
      return;
    }

    this._username = sessionRegistration.username;
    this._account = new SessionAccount({
      rpcUrl: this._rpcUrl,
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: this._policies,
    });

    return this._account;
  }
}
