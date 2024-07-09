import {
  Account,
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

import { Keychain, ResponseCodes, Modal, PaymasterOptions } from "./types";
import { Signer } from "./signer";
import { AsyncMethodReturns } from "@cartridge/penpal";

class DeviceAccount extends Account {
  address: string;
  private keychain: AsyncMethodReturns<Keychain>;
  private modal: Modal;
  private paymaster?: PaymasterOptions;

  constructor(
    rpcUrl: string,
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    modal: Modal,
    paymaster?: PaymasterOptions,
  ) {
    super(
      new RpcProvider({ nodeUrl: rpcUrl }),
      address,
      new Signer(keychain, modal),
    );
    this.address = address;
    this.keychain = keychain;
    this.modal = modal;
    this.paymaster = paymaster;
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
    transactionsDetail?: InvocationsDetails,
  ): Promise<InvokeFunctionResponse> {
    if (!transactionsDetail) {
      transactionsDetail = {};
    }

    try {
      let res = await this.keychain.execute(
        calls,
        transactionsDetail,
        false,
        this.paymaster,
      );
      if (res.code === ResponseCodes.SUCCESS) {
        return res as InvokeFunctionResponse;
      }

      this.modal.open();
      res = await this.keychain.execute(
        calls,
        transactionsDetail,
        true,
        this.paymaster,
      );
      this.modal.close();

      if (res.code !== ResponseCodes.SUCCESS) {
        return Promise.reject(res.message);
      }

      return res as InvokeFunctionResponse;
    } catch (e) {
      throw e;
    }
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
