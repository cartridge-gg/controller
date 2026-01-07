import {
  InvokeFunctionResponse,
  TypedData,
  WalletAccount,
  Call,
  AllowArray,
} from "starknet";

import {
  ConnectError,
  Keychain,
  KeychainOptions,
  Modal,
  ResponseCodes,
} from "./types";
import { AsyncMethodReturns } from "@cartridge/penpal";
import BaseProvider from "./provider";
import { toArray } from "./utils";
import { SIGNATURE } from "@starknet-io/types-js";

class ControllerAccount extends WalletAccount {
  private keychain: AsyncMethodReturns<Keychain>;
  private modal: Modal;
  private options?: KeychainOptions;

  constructor(
    provider: BaseProvider,
    rpcUrl: string,
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    options: KeychainOptions,
    modal: Modal,
  ) {
    super({
      provider: { nodeUrl: rpcUrl },
      walletProvider: provider,
      address,
    });

    this.keychain = keychain;
    this.options = options;
    this.modal = modal;
  }

  /**
   * Invoke execute function in account contract
   *
   * @param calls the invocation object or an array of them, containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * @param abis (optional) the abi of the contract for better displaying
   *
   * @returns response from addTransaction
   */
  async execute(calls: AllowArray<Call>): Promise<InvokeFunctionResponse> {
    calls = toArray(calls);

    return new Promise(async (resolve, reject) => {
      const sessionExecute = await this.keychain.execute(
        calls,
        undefined,
        undefined,
        false,
        this.options?.feeSource,
      );

      // Session call succeeded
      if (sessionExecute.code === ResponseCodes.SUCCESS) {
        resolve(sessionExecute as InvokeFunctionResponse);
        return;
      }

      // Propagates session txn error back to caller
      if (
        this.options?.propagateSessionErrors &&
        sessionExecute.code !== ResponseCodes.USER_INTERACTION_REQUIRED
      ) {
        reject((sessionExecute as ConnectError).error);
        return;
      }

      // Handle errorDisplayMode
      const errorDisplayMode = this.options?.errorDisplayMode || "modal";
      const error = (sessionExecute as ConnectError).error;

      // Exception: USER_INTERACTION_REQUIRED always shows modal UI
      // (SessionRefreshRequired and ManualExecutionRequired)
      const requiresUI =
        sessionExecute.code === ResponseCodes.USER_INTERACTION_REQUIRED;

      // Silent mode - no UI, just reject
      // Exception: USER_INTERACTION_REQUIRED goes to modal
      if (errorDisplayMode === "silent" && !requiresUI) {
        console.warn(
          "[Cartridge Controller] Transaction failed silently:",
          error,
        );
        reject(error);
        return;
      }

      // Notification mode - show clickable toast
      // Exception: USER_INTERACTION_REQUIRED goes directly to modal
      if (errorDisplayMode === "notification" && !requiresUI) {
        const { toast } = await import("./toast");

        let isHandled = false;
        let dismissFn: (() => void) | undefined;

        dismissFn = toast({
          variant: "error",
          message: error?.message || "Transaction failed",
          duration: 10000,
          onClick: () => {
            // Mark as handled and dismiss toast to prevent duplicate clicks
            isHandled = true;
            if (dismissFn) dismissFn();

            // Open modal when notification is clicked
            this.modal.open();
            this.keychain
              .execute(calls, undefined, undefined, true, error)
              .then((manualExecute) => {
                if (manualExecute.code === ResponseCodes.SUCCESS) {
                  resolve(manualExecute as InvokeFunctionResponse);
                  this.modal.close();
                } else {
                  reject((manualExecute as ConnectError).error);
                }
              });
          },
        });

        // If toast auto-dismisses without being clicked, reject the promise
        // Set timeout slightly longer than toast duration to allow for completion
        setTimeout(() => {
          if (!isHandled) {
            reject(error);
          }
        }, 10100);

        return;
      }

      // Default modal mode - existing behavior
      // Session call or Paymaster flow failed.
      // Session not avaialble, manual flow fallback
      this.modal.open();
      const manualExecute = await this.keychain.execute(
        calls,
        undefined,
        undefined,
        true,
        error,
      );

      // Manual call succeeded
      if (manualExecute.code === ResponseCodes.SUCCESS) {
        resolve(manualExecute as InvokeFunctionResponse);
        this.modal.close();
        return;
      }

      reject((manualExecute as ConnectError).error);
      return;
    });
  }

  /**
   * Sign an JSON object for off-chain usage with the starknet private key and return the signature
   * This adds a message prefix so it cant be interchanged with transactions
   *
   * @param json - JSON object to be signed
   * @returns the signature of the JSON object
   * @throws {Error} if the JSON object is not a valid JSON
   */
  async signMessage(typedData: TypedData): Promise<SIGNATURE> {
    return new Promise(async (resolve, reject) => {
      const sessionSign = await this.keychain.signMessage(typedData, "", true);

      // Session sign succeeded
      if (!("code" in sessionSign)) {
        resolve(sessionSign as SIGNATURE);
        return;
      }

      // Session not avaialble, manual flow fallback
      this.modal.open();
      const manualSign = await this.keychain.signMessage(typedData, "", false);

      if (!("code" in manualSign)) {
        resolve(manualSign as SIGNATURE);
      } else {
        reject((manualSign as ConnectError).error);
      }
      this.modal.close();
    });
  }
}

export default ControllerAccount;
