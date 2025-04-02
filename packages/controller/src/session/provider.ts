import { ec, stark, WalletAccount } from "starknet";

import SessionAccount from "./account";
import { KEYCHAIN_URL } from "../constants";
import BaseProvider from "../provider";
import { toWasmPolicies } from "../utils";
import { SessionPolicies } from "@cartridge/presets";
import { AddStarknetChainParameters } from "@starknet-io/types-js";
import { ParsedSessionPolicies } from "../policies";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

export type SessionOptions = {
  rpc: string;
  chainId: string;
  policies: SessionPolicies;
  redirectUrl: string;
  keychainUrl?: string;
};

export default class SessionProvider extends BaseProvider {
  public id = "controller_session";
  public name = "Controller Session";

  protected _chainId: string;
  protected _rpcUrl: string;
  protected _username?: string;
  protected _redirectUrl: string;
  protected _policies: ParsedSessionPolicies;
  protected _keychainUrl: string;

  constructor({
    rpc,
    chainId,
    policies,
    redirectUrl,
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
    this._redirectUrl = redirectUrl;
    this._keychainUrl = keychainUrl || KEYCHAIN_URL;

    if (typeof window !== "undefined") {
      (window as any).starknet_controller_session = this;
    }
  }

  private validatePoliciesSubset(
    newPolicies: ParsedSessionPolicies,
    existingPolicies: ParsedSessionPolicies,
  ): boolean {
    if (newPolicies.contracts) {
      if (!existingPolicies.contracts) return false;

      for (const [address, contract] of Object.entries(newPolicies.contracts)) {
        const existingContract = existingPolicies.contracts[address];
        if (!existingContract) return false;

        for (const method of contract.methods) {
          const existingMethod = existingContract.methods.find(
            (m) => m.entrypoint === method.entrypoint,
          );
          if (!existingMethod || !existingMethod.authorized) return false;
        }
      }
    }

    if (newPolicies.messages) {
      if (!existingPolicies.messages) return false;

      for (const message of newPolicies.messages) {
        const existingMessage = existingPolicies.messages.find(
          (m) =>
            JSON.stringify(m.domain) === JSON.stringify(message.domain) &&
            JSON.stringify(m.types) === JSON.stringify(message.types),
        );
        if (!existingMessage || !existingMessage.authorized) return false;
      }
    }

    return true;
  }

  async username() {
    await this.tryRetrieveFromQueryOrStorage();
    return this._username;
  }

  async probe(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    this.account = await this.tryRetrieveFromQueryOrStorage();
    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    this.account = await this.tryRetrieveFromQueryOrStorage();
    if (this.account) {
      return this.account;
    }

    const pk = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(pk);

    localStorage.setItem(
      "sessionSigner",
      JSON.stringify({
        privKey: pk,
        pubKey: publicKey,
      }),
    );

    localStorage.setItem("sessionPolicies", JSON.stringify(this._policies));

    const url = `${
      this._keychainUrl
    }/session?public_key=${publicKey}&redirect_uri=${
      this._redirectUrl
    }&redirect_query_name=startapp&policies=${JSON.stringify(
      this._policies,
    )}&rpc_url=${this._rpcUrl}`;

    localStorage.setItem("lastUsedConnector", this.id);
    window.open(url, "_blank");

    return this.account;
  }

  switchStarknetChain(_chainId: string): Promise<boolean> {
    throw new Error("switchStarknetChain not implemented");
  }

  addStarknetChain(_chain: AddStarknetChainParameters): Promise<boolean> {
    throw new Error("addStarknetChain not implemented");
  }

  disconnect(): Promise<void> {
    localStorage.removeItem("sessionSigner");
    localStorage.removeItem("session");
    localStorage.removeItem("sessionPolicies");
    this.account = undefined;
    this._username = undefined;
    return Promise.resolve();
  }

  async tryRetrieveFromQueryOrStorage() {
    if (this.account) {
      return this.account;
    }

    const signerString = localStorage.getItem("sessionSigner");
    const signer = signerString ? JSON.parse(signerString) : null;
    let sessionRegistration: SessionRegistration | null = null;

    if (window.location.search.includes("startapp")) {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("startapp");
      if (session) {
        sessionRegistration = JSON.parse(atob(session));
        localStorage.setItem("session", JSON.stringify(sessionRegistration));

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
      const sessionString = localStorage.getItem("session");
      if (sessionString) {
        sessionRegistration = JSON.parse(sessionString);
      }
    }

    if (!sessionRegistration || !signer) {
      return;
    }

    // Check expiration
    const expirationTime = parseInt(sessionRegistration.expiresAt) * 1000;
    if (Date.now() >= expirationTime) {
      this.clearStoredSession();
      return;
    }

    // Check stored policies
    const storedPoliciesStr = localStorage.getItem("sessionPolicies");
    if (storedPoliciesStr) {
      const storedPolicies = JSON.parse(
        storedPoliciesStr,
      ) as ParsedSessionPolicies;

      const isValid = this.validatePoliciesSubset(
        this._policies,
        storedPolicies,
      );

      if (!isValid) {
        this.clearStoredSession();
        return;
      }
    }

    this._username = sessionRegistration.username;
    this.account = new SessionAccount(this, {
      rpcUrl: this._rpcUrl,
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: toWasmPolicies(this._policies),
    });

    return this.account;
  }

  private clearStoredSession(): void {
    localStorage.removeItem("sessionSigner");
    localStorage.removeItem("session");
    localStorage.removeItem("sessionPolicies");
  }
}
