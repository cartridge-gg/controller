import { Policy } from "@cartridge/account-wasm";
import { CartridgeSessionAccount } from "@cartridge/account-wasm/session";
import {
  Abi,
  Account,
  Call,
  InvokeFunctionResponse,
  RpcProvider,
  Signature,
  TypedData,
  UniversalDetails,
} from "starknet";
import { SessionSigner } from "./signer";
import { normalizeCalls } from "./utils";

export * from "./errors";
export * from "./types";
export { defaultPresets } from "./presets";

export default class SessionAccount extends Account {
  public controller: CartridgeSessionAccount;

  constructor({
    rpcUrl,
    privateKey,
    address,
    ownerGuid,
    chainId,
    expiresAt,
    policies,
  }: {
    rpcUrl: string;
    privateKey: string;
    address: string;
    ownerGuid: string;
    chainId: string;
    expiresAt: number;
    policies: Policy[];
  }) {
    const controller = CartridgeSessionAccount.new_as_registered(
      rpcUrl,
      privateKey,
      address,
      ownerGuid,
      chainId,
      {
        expiresAt,
        policies,
      },
    );

    super(
      new RpcProvider({ nodeUrl: rpcUrl }),
      address,
      new SessionSigner(controller),
    );

    this.controller = controller;
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
    _abisOrDetails?: Abi[] | UniversalDetails,
    _transactionsDetail?: UniversalDetails,
  ): Promise<InvokeFunctionResponse> {
    return this.controller.execute(normalizeCalls(calls));
  }

  /**
   * Sign an JSON object for off-chain usage with the starknet private key and return the signature
   * This adds a message prefix so it cant be interchanged with transactions
   *
   * @param json - JSON object to be signed
   * @returns the signature of the JSON object
   * @throws {Error} if the JSON object is not a valid JSON
   */
  async signMessage(_typedData: TypedData): Promise<Signature> {
    throw new Error("signMessage not implemented for SessionSigner");
  }
}
