import { Connector } from "@starknet-react/core";
import { Policy } from "@cartridge/controller";
import { icon } from "./icon";
import { AccountInterface, ec, stark } from "starknet";
import SessionAccount from "@cartridge/controller/dist/session";
import { KEYCHAIN_URL } from "./constants";

interface StorageBackend {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

class SessionConnector extends Connector {
  private _chainId: string;
  private _storageBackend: StorageBackend;
  private _rpcUrl: string;
  private _policies: Policy[];
  private _publicKey: string;
  private controller?: SessionAccount & AccountInterface;

  constructor({
    rpcUrl,
    chainId,
    policies,
    storageBackend,
  }: {
    rpcUrl: string;
    chainId: string;
    policies: Policy[];
    storageBackend: StorageBackend;
  }) {
    super();

    this._rpcUrl = rpcUrl;
    this._policies = policies;
    this._storageBackend = storageBackend;

    // Generate a random local key pair
    const pk = stark.randomAddress();
    this._publicKey = ec.starkCurve.getStarkKey(pk);

    this._storageBackend.set("sessionSigner", JSON.stringify({
      privKey: pk,
      pubKey: this._publicKey,
    }));

    this._chainId = chainId;
  }

  readonly id = "controller";

  readonly name = "Controller";

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

  async connect() {
    const url = new URL(`${KEYCHAIN_URL}/session`);
    url.searchParams.set("public_key", this._publicKey);
    url.searchParams.set("redirect_uri", window.location.href);
    url.searchParams.set("redirect_query_name", "session");
    url.searchParams.set("policies", JSON.stringify(this._policies));
    url.searchParams.set("rpc_url", this._rpcUrl);

    window.location.replace(url.toString());

    return {
      account: '',
      chainId: await this.chainId(),
    };
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }

  async account() {
    await this.retrieveFromQueryOrStorage();

    if (!this.controller) {
      return Promise.reject("Session not registered");
    }

    return Promise.resolve(this.controller);
  }

  async retrieveFromQueryOrStorage() {
    const signer = JSON.parse((await this._storageBackend.get("sessionSigner"))!);
    let sessionRegistration: SessionRegistration | null = null;

    if (window.location.search.includes("session")) {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("session");
      if (session) {
        sessionRegistration = JSON.parse(session);
        this._storageBackend.set("session", JSON.stringify(sessionRegistration));
      }
    }

    if (!sessionRegistration) {
      sessionRegistration = JSON.parse((await this._storageBackend.get("session"))!);
    }

    if (!sessionRegistration) {
      throw new Error("No session registration found");
    }

    const account = new SessionAccount({
      rpcUrl: this._rpcUrl,
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: this._policies,
    });

    this.controller = account;
    return account;    
  }
}

export default SessionConnector;
