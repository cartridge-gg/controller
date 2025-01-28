import { ec, stark, WalletAccount } from "starknet";
import { SessionPolicies } from "@cartridge/presets";
import { AddStarknetChainParameters } from "@starknet-io/types-js";

import SessionAccount from "./account";
import { KEYCHAIN_URL } from "../constants";
import BaseProvider from "../provider";
import { toWasmPolicies } from "../utils";
import { ParsedSessionPolicies } from "../policies";
import { NodeBackend } from "./backend";

export type SessionOptions = {
  rpc: string;
  chainId: string;
  policies: SessionPolicies;
  basePath: string;
  keychainUrl?: string;
};

export default class SessionProvider extends BaseProvider {
  public id = "controller_session";
  public name = "Controller Session";

  protected _chainId: string;
  protected _rpcUrl: string;
  protected _username?: string;
  protected _policies: ParsedSessionPolicies;
  protected _keychainUrl: string;
  protected _backend: NodeBackend;

  constructor({
    rpc,
    chainId,
    policies,
    basePath,
    keychainUrl,
  }: SessionOptions) {
    super();

    this._policies = {
      verified: false,
      contracts: policies.contracts
        ? Object.fromEntries(
            Object.entries(policies.contracts).map(([address, contract]) => [
              address,
              {
                ...contract,
                methods: contract.methods.map((method) => ({
                  ...method,
                  authorized: true,
                })),
              },
            ]),
          )
        : undefined,
      messages: policies.messages?.map((message) => ({
        ...message,
        authorized: true,
      })),
    };

    this._rpcUrl = rpc;
    this._chainId = chainId;
    this._keychainUrl = keychainUrl || KEYCHAIN_URL;
    this._backend = new NodeBackend(basePath);
  }

  async username() {
    const sessionStr = await this._backend.get("session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.username;
    }
    return undefined;
  }

  async probe(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    const [sessionStr, signerStr] = await Promise.all([
      this._backend.get("session"),
      this._backend.get("signer"),
    ]);

    if (!sessionStr || !signerStr) {
      return undefined;
    }

    const session = JSON.parse(sessionStr);
    const signer = JSON.parse(signerStr);

    // Check expiration
    const expirationTime = parseInt(session.expiresAt) * 1000;
    if (Date.now() >= expirationTime) {
      await this.disconnect();
      return undefined;
    }

    this._username = session.username;
    this.account = new SessionAccount(this, {
      rpcUrl: this._rpcUrl,
      privateKey: signer.privKey,
      address: session.address,
      ownerGuid: session.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(session.expiresAt),
      policies: toWasmPolicies(this._policies),
    });

    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    const account = await this.probe();
    if (account) {
      return account;
    }

    const pk = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(pk);

    await this._backend.set(
      "signer",
      JSON.stringify({
        privKey: pk,
        pubKey: publicKey,
      }),
    );

    // Get redirect URI from local server
    const redirectUri = await this._backend.getRedirectUri();

    const url = `${
      this._keychainUrl
    }/session?public_key=${encodeURIComponent(publicKey)}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&redirect_query_name=startapp&policies=${encodeURIComponent(
      JSON.stringify(this._policies),
    )}&rpc_url=${encodeURIComponent(this._rpcUrl)}`;

    this._backend.openLink(url);

    // Wait for callback with session data
    const sessionData = await this._backend.waitForCallback();
    if (sessionData) {
      const sessionRegistration = JSON.parse(atob(sessionData));
      // Ensure addresses are properly formatted
      sessionRegistration.address = sessionRegistration.address.toLowerCase();
      sessionRegistration.ownerGuid =
        sessionRegistration.ownerGuid.toLowerCase();
      await this._backend.set("session", JSON.stringify(sessionRegistration));
      return this.probe();
    }

    return undefined;
  }

  async disconnect(): Promise<void> {
    await this._backend.delete("signer");
    await this._backend.delete("session");
    this.account = undefined;
    this._username = undefined;
  }

  switchStarknetChain(_chainId: string): Promise<boolean> {
    throw new Error("switchStarknetChain not implemented");
  }

  addStarknetChain(_chain: AddStarknetChainParameters): Promise<boolean> {
    throw new Error("addStarknetChain not implemented");
  }
}
