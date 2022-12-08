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
import qs from 'query-string';

import {
  Keychain,
} from "./types";
import { Signer } from "./signer";
import { AsyncMethodReturns } from "@cartridge/penpal";

class DeviceAccount extends Account {
  address: string;
  private keychain: AsyncMethodReturns<Keychain>;
  private url: string = "https://x.cartridge.gg";

  constructor(
    provider: RpcProvider,
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    options?: {
      url?: string;
    }
  ) {
    super(provider, address, new Signer(keychain, options));
    this.address = address;
    this.keychain = keychain;

    if (options?.url) {
      this.url = options.url;
    }
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
  async estimateInvokeFee(calls: Call | Call[], details?: EstimateFeeDetails): Promise<EstimateFee> {
    return this.keychain.estimateInvokeFee(calls, { ...details, chainId: this.chainId })
  }

  async estimateDeclareFee(payload: DeclareContractPayload, details?: EstimateFeeDetails): Promise<EstimateFee> {
    return this.keychain.estimateDeclareFee(payload, { ...details, chainId: this.chainId })
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
      chainId?: constants.StarknetChainId,
    }
  ): Promise<InvokeFunctionResponse> {
    if (!transactionsDetail) {
      transactionsDetail = {}
    }

    try {
      return await this.keychain.execute(calls, abis, transactionsDetail)
    } catch (e) {
      if ((e as Error).message !== "missing policies") {
        console.error(e)
        throw e
      }
    }

    window.open(
      `${this.url}/execute?${qs.stringify({
        ...transactionsDetail,
        origin: window.origin,
        calls: JSON.stringify(calls),
      })}`,
      "_blank",
      "height=650,width=450"
    );

    return this.keychain.execute(calls, abis, transactionsDetail, true);
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
    window.open(
      `${this.url}/sign?${qs.stringify({
        typedData: JSON.stringify(typedData),
      })}`,
      "_blank",
      "height=650,width=450"
    );

    return this.keychain.signMessage(typedData, this.address);
  }
}

export default DeviceAccount;