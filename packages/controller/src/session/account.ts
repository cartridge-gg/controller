import type { Policy } from "./internal/types";
import { CartridgeSessionAccount } from "./internal/account";
import {
  isSnip9CompatibilityError,
  SessionProtocolError,
} from "./internal/errors";
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
      return await this.controller.executeFromOutside(normalizeCalls(calls));
    } catch (e) {
      if (isSnip9CompatibilityError(e)) {
        // Direct execute() is not offered as a fallback because Cartridge
        // registers sessions with a guardian co-signer. The client signs
        // with a placeholder guardian key; Cartridge's relayer replaces it
        // with the real signature before submitting. Without the relayer in
        // the loop (i.e. direct execute), the placeholder reaches the chain
        // and fails validation.
        //
        // The session token format supports guardian-less sessions
        // (guardian_key_guid = 0x0), so this is a policy constraint of
        // Cartridge's current registration flow, not a protocol limitation.
        throw new SessionProtocolError(
          "This account does not support outside execution (SNIP-9). Direct session invocation is not supported in this client.",
          e,
        );
      }
      throw e;
    }
  }
}
