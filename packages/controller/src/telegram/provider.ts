import {
  cloudStorage,
  miniApp,
  openLink,
  retrieveLaunchParams,
} from "@telegram-apps/sdk";
import { ec, stark, WalletAccount } from "starknet";

import { KEYCHAIN_URL } from "../constants";
import SessionAccount from "../session/account";
import BaseProvider from "../provider";
import { toWasmPolicies } from "../utils";
import { SessionPolicies } from "@cartridge/presets";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

export default class TelegramProvider extends BaseProvider {
  private _tmaUrl: string;
  protected _chainId: string;
  protected _username?: string;
  protected _policies: SessionPolicies;

  constructor({
    rpc,
    chainId,
    policies,
    tmaUrl,
  }: {
    rpc: string;
    chainId: string;
    policies: SessionPolicies;
    tmaUrl: string;
  }) {
    super({
      rpc,
    });

    this._tmaUrl = tmaUrl;
    this._chainId = chainId;
    this._policies = policies;

    if (typeof window !== "undefined") {
      (window as any).starknet_controller = this;
    }
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
    )}&rpc_url=${this.rpc}`;

    localStorage.setItem("lastUsedConnector", this.id);
    openLink(url);
    miniApp.close();

    return;
  }

  disconnect(): Promise<void> {
    cloudStorage.deleteItem("sessionSigner");
    cloudStorage.deleteItem("session");
    this.account = undefined;
    this._username = undefined;
    return Promise.resolve();
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
    this.account = new SessionAccount(this, {
      rpcUrl: this.rpc.toString(),
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: toWasmPolicies(this._policies),
    });

    return this.account;
  }
}
