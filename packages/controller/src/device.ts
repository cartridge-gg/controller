import {
  Account,
  Abi,
  Call,
  EstimateFeeDetails,
  Signature,
  InvokeFunctionResponse,
  EstimateFee,
  DeclareContractPayload,
  RpcProvider,
  TypedData,
  InvocationsDetails,
} from "starknet";

import {
  ConnectError,
  Keychain,
  KeychainOptions,
  Modal,
  ResponseCodes,
} from "./types";
import { Signer } from "./signer";
import { AsyncMethodReturns } from "@cartridge/penpal";

class DeviceAccount extends Account {
  address: string;
  private keychain: AsyncMethodReturns<Keychain>;
  private modal: Modal;
  private options?: KeychainOptions;

  constructor(
    rpcUrl: string,
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    options: KeychainOptions,
    modal: Modal,
  ) {
    super(
      new RpcProvider({ nodeUrl: rpcUrl }),
      address,
      new Signer(keychain, modal),
    );
    this.address = address;
    this.keychain = keychain;
    this.options = options;
    this.modal = modal;
  }

  /**
   * Estimate Fee for a method on starknet
   *
   * @param calls the invocation object containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   *
   * @returns response from addTransaction
   */
  async estimateInvokeFee(
    calls: Call | Call[],
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee> {
    return this.keychain.estimateInvokeFee(calls, {
      ...details,
    });
  }

  async estimateDeclareFee(
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee> {
    return this.keychain.estimateDeclareFee(payload, {
      ...details,
    });
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
  // @ts-expect-error TODO: fix overload type mismatch
  async execute(
    calls: Call | Call[],
    abis?: Abi[],
    transactionsDetail: InvocationsDetails = {},
  ): Promise<InvokeFunctionResponse> {
    return new Promise(async (resolve, reject) => {
      const sessionExecute = await this.keychain.execute(
        calls,
        abis,
        transactionsDetail,
        false,
        this.options?.paymaster,
      );

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
        abis,
        transactionsDetail,
        true,
        this.options?.paymaster,
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
  async signMessage(typedData: TypedData): Promise<Signature> {
    try {
      this.modal.open();
      const res = await this.keychain.signMessage(typedData, this.address);
      this.modal.close();
      return res as Signature;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

export default DeviceAccount;
