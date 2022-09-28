import cuid from "cuid";
import {
  Account,
  DeployContractPayload,
  Abi,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  DeployContractResponse as StarknetDeployContractResponse,
  InvocationsDetails,
  Signature,
  typedData,
  InvokeFunctionResponse,
  defaultProvider,
} from "starknet";
import { toBN } from "starknet/utils/number";
import qs from 'query-string';

import Messenger from "./messenger";
import {
  Scope,
  DeployContractResponse,
  EstimateFeeResponse,
  ExecuteRequest,
  ExecuteResponse,
  SignMessageResponse,
  EstimateFeeRequest,
} from "./types";
import { Signer } from "./signer";

class CartridgeAccount extends Account {
  address: string;
  private messenger: Messenger;
  private url: string = "https://x.cartridge.gg";
  private _scopes: Scope[] = [];

  constructor(
    address: string,
    scopes: Scope[] = [],
    messenger: Messenger,
    options?: {
      url?: string;
    }
  ) {
    super(defaultProvider, address, new Signer(messenger, options));
    this.address = address;
    this.messenger = messenger;
    this._scopes = scopes;

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
    const id = cuid();

    window.open(
      `${this.url}/deploy?origin=${encodeURIComponent(
        window.origin
      )}&id=${id}`,
      "_blank",
      "height=650,width=400"
    );

    const response = await this.messenger.send<DeployContractResponse>({
      method: "deploy-contract",
      params: {
        id,
        payload,
        abi,
      },
    });

    if (response.error) {
      throw new Error(response.error as string);
    }

    return response.result!;
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
  async estimateFee(calls: Call | Call[], { nonce: providedNonce, blockIdentifier }: EstimateFeeDetails = {}): Promise<EstimateFee> {
    const nonce = toBN(providedNonce ?? (await this.getNonce()));

    const response = await this.messenger.send<EstimateFeeResponse>({
      method: "estimate-fee",
      params: {
        calls,
        nonce,
        blockIdentifier,
      },
    } as EstimateFeeRequest);

    if (response.error) {
      throw new Error(response.error as string);
    }

    return response.result!;
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
    transactionsDetail?: InvocationsDetails
  ): Promise<InvokeFunctionResponse> {
    let response = await this.messenger.send<ExecuteResponse>({
      method: "execute",
      params: {
        calls,
        abis,
        transactionsDetail,
      },
    });

    if (response.result) {
      return response.result;
    }

    if (response.error && response.error !== "missing scopes") {
      throw new Error(response.error as string);
    }

    const id = cuid();

    window.open(
      `${this.url}/execute?${qs.stringify({
        id,
        origin: window.origin,
        calls: JSON.stringify(calls),
      })}`,
      "_blank",
      "height=650,width=400"
    );

    response = await this.messenger.send<ExecuteResponse>({
      method: "execute",
      params: {
        id,
        calls,
        abis,
        transactionsDetail,
      },
    } as ExecuteRequest);

    if (response.error) {
      throw new Error(response.error as string);
    }

    return response.result!;
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
    const id = cuid();

    window.open(
      `${this.url}/sign?${qs.stringify({
        id,
        origin: window.origin,
        typedData: JSON.stringify(typedData),
      })}`,
      "_blank",
      "height=650,width=400"
    );

    const response = await this.messenger.send<SignMessageResponse>({
      method: "sign-message",
      params: {
        id,
        typedData,
      },
    });

    if (response.error) {
      throw new Error(response.error as string);
    }

    return response.result!;
  }
}

export default CartridgeAccount;