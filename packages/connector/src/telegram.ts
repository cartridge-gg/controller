import {
  cloudStorage,
  miniApp,
  openLink,
  retrieveLaunchParams,
} from "@telegram-apps/sdk";
import { Connector } from "@starknet-react/core";
import { ec, stark } from "starknet";

import { Policy } from "@cartridge/controller";
import SessionAccount from "@cartridge/controller/session";

import { icon } from "./icon";
import { KEYCHAIN_URL } from "./constants";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

export default class SessionConnector extends Connector {
  private _chainId: string;
  private _rpcUrl: string;
  private _policies: Policy[];
  private _username?: string;
  private _tmaUrl: string;
  private _account?: SessionAccount;

  constructor({
    rpcUrl,
    chainId,
    policies,
    tmaUrl,
  }: {
    rpcUrl: string;
    chainId: string;
    policies: Policy[];
    tmaUrl: string;
  }) {
    super();

    this._rpcUrl = rpcUrl;
    this._policies = policies;
    this._chainId = chainId;
    this._tmaUrl = tmaUrl;
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

    cloudStorage.setItem(
      "sessionSigner",
      JSON.stringify({
        privKey: pk,
        pubKey: publicKey,
      }),
    );

    const url = `${KEYCHAIN_URL}/session?public_key=${publicKey}&redirect_uri=${
      this._tmaUrl
    }&redirect_query_name=startapp&policies=${JSON.stringify(
      this._policies,
    )}&rpc_url=${this._rpcUrl}`;

    localStorage.setItem("lastUsedConnector", this.id);
    openLink(url);
    miniApp.close();

    return {
      account: "",
      chainId: await this.chainId(),
    };
  }

  disconnect(): Promise<void> {
    cloudStorage.deleteItem("sessionSigner");
    cloudStorage.deleteItem("session");
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
    const signer = JSON.parse((await cloudStorage.getItem("sessionSigner"))!);
    let sessionRegistration: SessionRegistration | null = null;

    const launchParams = retrieveLaunchParams();
    const session = launchParams.startParam;
    if (session) {
      sessionRegistration = JSON.parse(atob(session));
      cloudStorage.setItem("session", JSON.stringify(sessionRegistration));
    }

    if (!sessionRegistration) {
      const session = await cloudStorage.getItem("session");
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
