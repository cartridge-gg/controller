import { WalletAccount } from "starknet";
import {
  AddInvokeTransactionParameters,
  AddStarknetChainParameters,
  Errors,
  Permission,
  RequestAccountsParameters,
  RequestFn,
  StarknetWindowObject,
  SwitchStarknetChainParameters,
  TypedData,
  WalletEventHandlers,
  WalletEventListener,
  WalletEvents,
} from "@starknet-io/types-js";
import manifest from "../package.json";

import { icon } from "./icon";
import { Mutex } from "./mutex";

const mutex = new Mutex();

export default abstract class BaseProvider implements StarknetWindowObject {
  public id = "controller";
  public name = "Controller";
  public version = manifest.version;
  public icon = icon;

  public account?: WalletAccount;
  public subscriptions: WalletEvents[] = [];

  private _probePromise: Promise<WalletAccount | undefined> | null = null;

  protected async safeProbe(): Promise<WalletAccount | undefined> {
    // If we already have an account, return it
    if (this.account) {
      return this.account;
    }

    // If we're already probing, wait for the existing probe
    if (this._probePromise) {
      return this._probePromise;
    }

    const release = await mutex.obtain();
    return await new Promise<WalletAccount | undefined>(async (resolve) => {
      try {
        this._probePromise = this.probe();
        const result = await this._probePromise;
        resolve(result);
      } finally {
        this._probePromise = null;
      }
    }).finally(() => {
      release();
    });
  }

  request: RequestFn = async (call) => {
    switch (call.type) {
      case "wallet_getPermissions":
        await this.safeProbe();

        if (this.account) {
          return [Permission.ACCOUNTS];
        }

        return [];

      case "wallet_requestAccounts": {
        if (this.account) {
          return [this.account.address];
        }

        const silentMode =
          call.params && (call.params as RequestAccountsParameters).silent_mode;

        this.account = await this.safeProbe();

        if (!this.account && !silentMode) {
          this.account = await this.connect();
        }

        if (this.account) {
          return [this.account.address];
        }

        return [];
      }

      case "wallet_watchAsset":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_watchAsset not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_addStarknetChain": {
        let params = call.params as AddStarknetChainParameters;
        return this.addStarknetChain(params);
      }

      case "wallet_switchStarknetChain": {
        let params = call.params as SwitchStarknetChainParameters;
        return this.switchStarknetChain(params.chainId);
      }

      case "wallet_requestChainId":
        if (!this.account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "Account not initialized",
          } as Errors.UNEXPECTED_ERROR;
        }

        return await this.account.getChainId();

      case "wallet_deploymentData":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_deploymentData not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_addInvokeTransaction":
        if (!this.account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "Account not initialized",
          } as Errors.UNEXPECTED_ERROR;
        }

        let params = call.params as AddInvokeTransactionParameters;
        return await this.account.execute(
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

      case "wallet_signTypedData": {
        if (!this.account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "Account not initialized",
          } as Errors.UNEXPECTED_ERROR;
        }

        return await this.account.signMessage(call.params as TypedData);
      }

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

  protected emitNetworkChanged(chainId: string) {
    this.subscriptions
      .filter((sub) => sub.type === "networkChanged")
      .forEach((sub) => {
        (sub.handler as WalletEventHandlers["networkChanged"])(chainId);
      });
  }

  protected emitAccountsChanged(accounts: string[]) {
    this.subscriptions
      .filter((sub) => sub.type === "accountsChanged")
      .forEach((sub) => {
        (sub.handler as WalletEventHandlers["accountsChanged"])(accounts);
      });
  }

  abstract probe(): Promise<WalletAccount | undefined>;
  abstract connect(): Promise<WalletAccount | undefined>;
  abstract switchStarknetChain(chainId: string): Promise<boolean>;
  abstract addStarknetChain(
    chain: AddStarknetChainParameters,
  ): Promise<boolean>;
}
