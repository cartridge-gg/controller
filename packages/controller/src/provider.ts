import { WalletAccount } from "starknet";
import {
  AddInvokeTransactionParameters,
  Errors,
  Permission,
  RequestFn,
  StarknetWindowObject,
  TypedData,
  WalletEventHandlers,
  WalletEventListener,
  WalletEvents,
} from "@starknet-io/types-js";

import { icon } from "./icon";
import { ProviderOptions } from "./types";

export default abstract class BaseProvider implements StarknetWindowObject {
  public id = "controller";
  public name = "Controller";
  public version = "0.4.0";
  public icon = icon;

  public rpc: URL;
  public account?: WalletAccount;
  public subscriptions: WalletEvents[] = [];

  constructor(options: ProviderOptions) {
    const { rpc } = options;

    this.rpc = new URL(rpc);
  }

  request: RequestFn = async (call) => {
    switch (call.type) {
      case "wallet_getPermissions":
        await this.probe();

        if (this.account) {
          return [Permission.ACCOUNTS];
        }

        return [];

      case "wallet_requestAccounts": {
        if (this.account) {
          return [this.account.address];
        }

        this.account = await this.probe();
        if (!this.account) {
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
        if (!this.account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "wallet_deploymentData not implemented",
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
            data: "wallet_deploymentData not implemented",
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

  abstract probe(): Promise<WalletAccount | undefined>;
  abstract connect(): Promise<WalletAccount | undefined>;
}
