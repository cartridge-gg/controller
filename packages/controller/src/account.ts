import {
  InvokeFunctionResponse,
  TypedData,
  WalletAccount,
  Call,
  AllowArray,
} from "starknet";

import { SPEC } from "@starknet-io/types-js";

import {
  ConnectError,
  Keychain,
  KeychainOptions,
  Modal,
  ResponseCodes,
} from "./types";
import { AsyncMethodReturns } from "@cartridge/penpal";
import BaseProvider from "./provider";

class ControllerAccount extends WalletAccount {
  address: string;
  private keychain: AsyncMethodReturns<Keychain>;
  private modal: Modal;
  private options?: KeychainOptions;

  constructor(
    provider: BaseProvider,
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    options: KeychainOptions,
    modal: Modal,
  ) {
    super({ nodeUrl: provider.rpc.toString() }, provider);

    this.address = address;
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
    calls = Array.isArray(calls) ? calls : [calls];

    return new Promise(async (resolve, reject) => {
      const sessionExecute = await this.keychain.execute(calls, false);

      // Session call succeeded
      if (sessionExecute.code === ResponseCodes.SUCCESS) {
        resolve(sessionExecute as InvokeFunctionResponse);
        return;
      }

      // Propagates session txn error back to caller
      if (this.options?.propagateSessionErrors) {
        reject((sessionExecute as ConnectError).error);
        return;
      }

      // Session call or Paymaster flow failed.
      // Session not avaialble, manual flow fallback
      this.modal.open();
      const manualExecute = await this.keychain.execute(
        calls,
        true,
        (sessionExecute as ConnectError).error,
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
  async signMessage(typedData: TypedData): Promise<SPEC.SIGNATURE> {
    try {
      this.modal.open();
      const res = await this.keychain.signMessage(typedData);
      this.modal.close();

      if ("code" in res) {
        throw res;
      }

      return res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

export default ControllerAccount;
