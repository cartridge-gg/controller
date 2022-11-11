import {
  Account,
  DeployContractPayload,
  Abi,
  Call,
  EstimateFeeDetails,
  DeployContractResponse as StarknetDeployContractResponse,
  InvocationsDetails,
  Signature,
  typedData,
  InvokeFunctionResponse,
  defaultProvider,
  EstimateFee,
  DeclareContractPayload,
} from "starknet";
import qs from 'query-string';

import {
  Keychain,
} from "./types";
import { Signer } from "./signer";
import { AsyncMethodReturns } from "@cartridge/penpal";
import { StarknetChainId } from "starknet/dist/constants";

class DeviceAccount extends Account {
  address: string;
  private keychain: AsyncMethodReturns<Keychain>;
  private url: string = "https://x.cartridge.gg";

  constructor(
    address: string,
    keychain: AsyncMethodReturns<Keychain>,
    options?: {
      url?: string;
    }
  ) {
    super(defaultProvider, address, new Signer(keychain, options));
    this.address = address;
    this.keychain = keychain;

    if (options?.url) {
      this.url = options.url;
    }
  }

  /**
   * Deploys a given compiled contract (json) to starknet
   *
   * @param payload payload to be deployed containing:
   * - compiled contract code
   * - constructor calldata
   * - address salt
   * @param abi the abi of the contract
   * @returns a confirmation of sending a transaction on the starknet contract
   */
  async deployContract(
    payload: DeployContractPayload,
    abi?: Abi
  ): Promise<StarknetDeployContractResponse> {
    throw new Error("unimplemented");
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
    return this.keychain.estimateInvokeFee(calls, details)
  }

  async estimateDeclareFee(payload: DeclareContractPayload, details?: EstimateFeeDetails): Promise<EstimateFee> {
    return this.keychain.estimateDeclareFee(payload, details)
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
      chainId?: StarknetChainId,
    }
  ): Promise<InvokeFunctionResponse> {
    if (!transactionsDetail) {
      transactionsDetail = {}
    }

    if (!transactionsDetail.nonce) {
      transactionsDetail.nonce = 0 //await this.getNonce();
    }

    if (!transactionsDetail.version) {
      transactionsDetail.version = 1;
    }

    if (!transactionsDetail.maxFee) {
      try {
        transactionsDetail.maxFee = "100" // (await this.estimateFee(calls, { nonce: transactionsDetail.nonce })).suggestedMaxFee
      } catch (e) {
        console.error(e)
        throw e
      }
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
        origin: window.origin,
        calls: JSON.stringify(calls),
        nonce: transactionsDetail.nonce,
        version: transactionsDetail.version,
        maxFee: transactionsDetail.maxFee,
        chainId: transactionsDetail.chainId ? transactionsDetail.chainId : StarknetChainId.TESTNET,
      })}`,
      "_blank",
      "height=650,width=400"
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
      "height=650,width=400"
    );

    return this.keychain.signMessage(typedData, this.address);
  }
}

export default DeviceAccount;