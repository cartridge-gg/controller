import { Policy } from "@cartridge/account-wasm";
import { CartridgeSessionAccount } from "@cartridge/account-wasm/session";
import { Call, InvokeFunctionResponse, WalletAccount } from "starknet";

import { normalizeCalls } from "../utils";
import BaseProvider from "../provider";

export * from "../errors";
export * from "../types";

export default class SessionAccount extends WalletAccount {
  public controller: CartridgeSessionAccount;

  constructor(
    provider: BaseProvider,
    {
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
    },
  ) {
    super({ nodeUrl: rpcUrl }, provider);

    this.controller = CartridgeSessionAccount.new_as_registered(
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
  async execute(calls: Call | Call[]): Promise<InvokeFunctionResponse> {
    return this.controller.execute(normalizeCalls(calls));
  }
}
