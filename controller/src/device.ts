import {
  constants,
  Account,
  Abi,
  Call,
  EstimateFeeDetails,
  InvocationsDetails,
  Signature,
  typedData,
  InvokeFunctionResponse,
  EstimateFee,
  DeclareContractPayload,
  RpcProvider,
} from "starknet";

import { Keychain, ResponseCodes, Modal } from "./types";
import { Signer } from "./signer";
import { AsyncMethodReturns } from "@cartridge/penpal";

class DeviceAccount extends Account {
  address: string;
  private keychain: AsyncMethodReturns<Keychain>;
  private modal: Modal;

  constructor(
    provider: RpcProvider,
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    modal: Modal
  ) {
    super(provider, address, new Signer(keychain, modal));
    this.address = address;
    this.keychain = keychain;
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
    details?: EstimateFeeDetails
  ): Promise<EstimateFee> {
    return this.keychain.estimateInvokeFee(calls, {
      ...details,
      chainId: this.chainId,
    });
  }

  async estimateDeclareFee(
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails
  ): Promise<EstimateFee> {
    return this.keychain.estimateDeclareFee(payload, {
      ...details,
      chainId: this.chainId,
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
  async execute(
    calls: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails & {
      chainId?: constants.StarknetChainId;
    }
  ): Promise<InvokeFunctionResponse> {
    if (!transactionsDetail) {
      transactionsDetail = {};
    }

    try {
      const res = await this.keychain.execute(calls, abis, transactionsDetail);
      if (res.code === ResponseCodes.SUCCESS) {
        return res as InvokeFunctionResponse;
      }

      this.modal.open();
      const res2 = await this.keychain.execute(
        calls,
        abis,
        transactionsDetail,
        true
      );
      return res2 as InvokeFunctionResponse;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      this.modal.close();
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
  async signMessage(typedData: typedData.TypedData): Promise<Signature> {
    this.modal.open();
    const res = await this.keychain.signMessage(typedData, this.address);
    this.modal.close();
    return res;
  }
}

export default DeviceAccount;
