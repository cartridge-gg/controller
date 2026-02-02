import { ec, stark, WalletAccount } from "starknet";

import {
  signerToGuid,
  subscribeCreateSession,
} from "@cartridge/controller-wasm";
import { SessionPolicies } from "@cartridge/presets";
import { AddStarknetChainParameters } from "@starknet-io/types-js";
import { encode } from "starknet";
import { API_URL, KEYCHAIN_URL } from "../constants";
import { ParsedSessionPolicies } from "../policies";
import BaseProvider from "../provider";
import { AuthOptions } from "../types";
import { toWasmPolicies } from "../utils";
import SessionAccount from "./account";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
  guardianKeyGuid: string;
  metadataHash: string;
  sessionKeyGuid: string;
}

export type SessionOptions = {
  rpc: string;
  chainId: string;
  policies: SessionPolicies;
  redirectUrl: string;
  disconnectRedirectUrl?: string;
  keychainUrl?: string;
  apiUrl?: string;
  signupOptions?: AuthOptions;
};

export default class SessionProvider extends BaseProvider {
  public id = "controller_session";
  public name = "Controller Session";

  protected _chainId: string;
  protected _rpcUrl: string;
  protected _username?: string;
  protected _redirectUrl: string;
  protected _disconnectRedirectUrl?: string;
  protected _policies: ParsedSessionPolicies;
  protected _keychainUrl: string;
  protected _apiUrl: string;
  protected _publicKey: string;
  protected _sessionKeyGuid: string;
  protected _signupOptions?: AuthOptions;
  public reopenBrowser: boolean = true;

  constructor({
    rpc,
    chainId,
    policies,
    redirectUrl,
    disconnectRedirectUrl,
    keychainUrl,
    apiUrl,
    signupOptions,
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
    this._disconnectRedirectUrl = disconnectRedirectUrl;
    this._keychainUrl = keychainUrl || KEYCHAIN_URL;
    this._apiUrl = apiUrl ?? API_URL;
    this._signupOptions = signupOptions;

    const account = this.tryRetrieveFromQueryOrStorage();
    if (!account) {
      const pk = stark.randomAddress();
      this._publicKey = ec.starkCurve.getStarkKey(pk);

      localStorage.setItem(
        "sessionSigner",
        JSON.stringify({
          privKey: pk,
          pubKey: this._publicKey,
        }),
      );
      this._sessionKeyGuid = signerToGuid({
        starknet: { privateKey: encode.addHexPrefix(pk) },
      });
    } else {
      const pk = localStorage.getItem("sessionSigner");
      if (!pk) throw new Error("failed to get sessionSigner");

      const jsonPk: {
        privKey: string;
        pubKey: string;
      } = JSON.parse(pk);

      this._publicKey = jsonPk.pubKey;
      this._sessionKeyGuid = signerToGuid({
        starknet: { privateKey: encode.addHexPrefix(jsonPk.privKey) },
      });
    }

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

  private padBase64(value: string): string {
    const padding = value.length % 4;
    if (padding === 0) {
      return value;
    }
    return value + "=".repeat(4 - padding);
  }

  private normalizeSession(
    session: Partial<SessionRegistration>,
  ): SessionRegistration | undefined {
    if (
      session.username === undefined ||
      session.address === undefined ||
      session.ownerGuid === undefined ||
      session.expiresAt === undefined
    ) {
      return undefined;
    }

    return {
      username: session.username,
      address: session.address,
      ownerGuid: session.ownerGuid,
      transactionHash: session.transactionHash,
      expiresAt: session.expiresAt,
      guardianKeyGuid: session.guardianKeyGuid ?? "0x0",
      metadataHash: session.metadataHash ?? "0x0",
      sessionKeyGuid: session.sessionKeyGuid ?? this._sessionKeyGuid,
    };
  }

  public ingestSessionFromRedirect(
    encodedSession: string,
  ): SessionRegistration | undefined {
    try {
      const decoded = atob(this.padBase64(encodedSession));
      const parsed = JSON.parse(decoded) as Partial<SessionRegistration>;
      const normalized = this.normalizeSession(parsed);
      if (!normalized) {
        return undefined;
      }
      localStorage.setItem("session", JSON.stringify(normalized));
      return normalized;
    } catch (e) {
      console.error("Failed to ingest session redirect", e);
      return undefined;
    }
  }

  async username() {
    await this.tryRetrieveFromQueryOrStorage();
    return this._username;
  }

  async probe(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    this.account = this.tryRetrieveFromQueryOrStorage();
    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    this.account = this.tryRetrieveFromQueryOrStorage();
    if (this.account) {
      return this.account;
    }

    localStorage.setItem("sessionPolicies", JSON.stringify(this._policies));
    localStorage.setItem("lastUsedConnector", this.id);

    try {
      if (this.reopenBrowser) {
        const pk = stark.randomAddress();
        this._publicKey = ec.starkCurve.getStarkKey(pk);

        localStorage.setItem(
          "sessionSigner",
          JSON.stringify({
            privKey: pk,
            pubKey: this._publicKey,
          }),
        );
        this._sessionKeyGuid = signerToGuid({
          starknet: { privateKey: encode.addHexPrefix(pk) },
        });
        let url = `${
          this._keychainUrl
        }/session?public_key=${this._publicKey}&redirect_uri=${
          this._redirectUrl
        }&redirect_query_name=startapp&policies=${JSON.stringify(
          this._policies,
        )}&rpc_url=${this._rpcUrl}`;

        if (this._signupOptions) {
          url += `&signers=${encodeURIComponent(JSON.stringify(this._signupOptions))}`;
        }

        window.open(url, "_blank");
      }

      const sessionResult = await subscribeCreateSession(
        this._sessionKeyGuid,
        this._apiUrl,
      );

      // auth is: [shortstring!('authorization-by-registered'), owner_guid]
      const ownerGuid = sessionResult.authorization[1];
      const session: SessionRegistration = {
        username: sessionResult.controller.accountID,
        address: sessionResult.controller.address,
        ownerGuid,
        expiresAt: sessionResult.expiresAt,
        guardianKeyGuid: "0x0",
        metadataHash: "0x0",
        sessionKeyGuid: this._sessionKeyGuid,
      };
      localStorage.setItem("session", JSON.stringify(session));

      this.tryRetrieveFromQueryOrStorage();

      return this.account;
    } catch (e) {
      console.log(e);
      throw e;
    }
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
    localStorage.removeItem("lastUsedConnector");
    this.account = undefined;
    this._username = undefined;
    const disconnectUrl = new URL(`${this._keychainUrl}`);
    disconnectUrl.pathname = "disconnect";

    this._disconnectRedirectUrl &&
      disconnectUrl.searchParams.append(
        "redirect_url",
        this._disconnectRedirectUrl,
      );

    const openedWindow = window.open(disconnectUrl);
    if (openedWindow === null) return Promise.resolve();

    const { resolve, promise } = Promise.withResolvers<void>();
    function onWindowClose() {
      if (openedWindow?.closed) {
        resolve();
        clearInterval(checkInterval);
      }
    }
    const checkInterval = setInterval(onWindowClose, 500);
    return promise;
  }

  tryRetrieveFromQueryOrStorage() {
    if (this.account) {
      return this.account;
    }

    const signerString = localStorage.getItem("sessionSigner");
    const signer = signerString ? JSON.parse(signerString) : null;
    let sessionRegistration: SessionRegistration | null = null;

    const sessionString = localStorage.getItem("session");
    if (sessionString) {
      const parsed = JSON.parse(sessionString) as Partial<SessionRegistration>;
      const normalized = this.normalizeSession(parsed);
      if (normalized) {
        sessionRegistration = normalized;
        localStorage.setItem("session", JSON.stringify(sessionRegistration));
      } else {
        this.clearStoredSession();
      }
    }

    if (window.location.search.includes("startapp")) {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("startapp");
      if (session) {
        const normalizedSession = this.ingestSessionFromRedirect(session);
        if (
          normalizedSession &&
          Number(normalizedSession.expiresAt) !==
            Number(sessionRegistration?.expiresAt)
        ) {
          sessionRegistration = normalizedSession;
        }

        // Remove the session query parameter
        params.delete("startapp");
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "") +
          window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
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
      guardianKeyGuid: sessionRegistration.guardianKeyGuid,
      metadataHash: sessionRegistration.metadataHash,
      sessionKeyGuid: sessionRegistration.sessionKeyGuid,
    });

    return this.account;
  }

  private clearStoredSession(): void {
    localStorage.removeItem("sessionSigner");
    localStorage.removeItem("session");
    localStorage.removeItem("sessionPolicies");
    localStorage.removeItem("lastUsedConnector");
  }
}
