import { Policy } from "@cartridge/controller";
import { ec, stark } from "starknet";
import {
  AddInvokeTransactionParameters,
  Errors,
  Permission,
  RequestAccountsParameters,
  RequestFn,
  StarknetWindowObject,
  WalletEventHandlers,
  WalletEventListener,
  WalletEvents,
} from "@starknet-io/types-js";

import SessionAccount from "./account";
import { icon } from "../icon";
import { KEYCHAIN_URL } from "src/constants";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
}

export default class SessionProvider implements StarknetWindowObject {
  readonly id = "ControllerSession";
  readonly name = "Controller";
  readonly version = "0.4.0";
  readonly icon = icon;

  protected _chainId: string;
  protected _backend: UnifiedBackend;
  protected _rpcUrl: string;
  protected _policies: Policy[];
  protected _username?: string;
  protected _redirectUrl: string;
  protected _account?: SessionAccount;
  protected subscriptions: WalletEvents[] = [];

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
    this._rpcUrl = rpcUrl;
    this._policies = policies;
    this._backend = backend;
    this._chainId = chainId;
    this._redirectUrl = redirectUrl;
  }

  request: RequestFn = async (call) => {
    switch (call.type) {
      case "wallet_getPermissions":
        await this.tryRetrieveFromQueryOrStorage();

        if (this._account) {
          return [Permission.ACCOUNTS];
        }

        return [];

      case "wallet_requestAccounts": {
        await this.tryRetrieveFromQueryOrStorage();

        if (this._account) {
          return [this._account.address];
        }

        const params = call.params as RequestAccountsParameters;

        if (!params?.silent_mode) {
          await this.connect();
        }

        return [];
      }

      case "wallet_watchAsset":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_watchAsset not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_addStarknetChain":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_addStarknetChain not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_switchStarknetChain":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_switchStarknetChain not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_requestChainId":
        if (!this._account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "wallet_deploymentData not implemented",
          } as Errors.UNEXPECTED_ERROR;
        }

        return this._chainId;

      case "wallet_deploymentData":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_deploymentData not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_addInvokeTransaction":
        if (!this._account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "wallet_deploymentData not implemented",
          } as Errors.UNEXPECTED_ERROR;
        }

        let params = call.params as AddInvokeTransactionParameters;
        return await this._account.execute(
          params.calls.map((call) => ({
            contractAddress: call.contract_address,
            entrypoint: call.entry_point,
            calldata: call.calldata,
          })),
        );

      case "wallet_addDeclareTransaction":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_addDeclareTransaction not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_signTypedData":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_signTypedData not implemented",
        } as Errors.UNEXPECTED_ERROR;
      case "wallet_supportedSpecs":
        return [];
      case "wallet_supportedWalletApi":
        return [];
      default:
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: `Unknown RPC call type: ${call.type}`,
        } as Errors.UNEXPECTED_ERROR;
    }
  };

  on: WalletEventListener = <E extends keyof WalletEventHandlers>(
    event: E,
    handler: WalletEventHandlers[E],
  ): void => {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      throw new Error(`Unknown event: ${event}`);
    }
    this.subscriptions.push({ type: event, handler } as WalletEvents);
  };

  off: WalletEventListener = <E extends keyof WalletEventHandlers>(
    event: E,
    handler: WalletEventHandlers[E],
  ): void => {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      throw new Error(`Unknown event: ${event}`);
    }
    const idx = this.subscriptions.findIndex(
      (sub) => sub.type === event && sub.handler === handler,
    );
    if (idx >= 0) {
      this.subscriptions.splice(idx, 1);
    }
  };

  async chainId() {
    return Promise.resolve(BigInt(this._chainId));
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
    this._account = new SessionAccount(this, {
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
