import { Policy } from "@cartridge/controller-wasm";
import { CartridgeSessionAccount } from "@cartridge/controller-wasm/session";
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
      guardianKeyGuid,
      metadataHash,
      sessionKeyGuid,
    }: {
      rpcUrl: string;
      privateKey: string;
      address: string;
      ownerGuid: string;
      chainId: string;
      expiresAt: number;
      policies: Policy[];
      guardianKeyGuid: string;
      metadataHash: string;
      sessionKeyGuid: string;
    },
  ) {
    super({
      provider: { nodeUrl: rpcUrl },
      walletProvider: provider,
      address,
    });

    this.controller = CartridgeSessionAccount.newAsRegistered(
      rpcUrl,
      privateKey,
      address,
      ownerGuid,
      chainId,
      {
        expiresAt,
        policies,
        guardianKeyGuid: guardianKeyGuid ?? "0x0",
        metadataHash: metadataHash ?? "0x0",
        sessionKeyGuid: sessionKeyGuid,
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
    try {
      const res = await this.controller.executeFromOutside(
        normalizeCalls(calls),
      );
      return res;
    } catch (e) {
      return this.controller.execute(normalizeCalls(calls));
    }
  }
}
