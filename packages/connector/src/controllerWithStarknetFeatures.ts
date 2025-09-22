import ControllerProvider, { ControllerOptions } from "@cartridge/controller";

import {
  StandardConnect,
  type StandardConnectMethod,
  type StandardConnectInput,
  type StandardConnectOutput,
  StandardDisconnect,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsOnMethod,
} from "@wallet-standard/features";

import type { RequestFn } from "@starknet-io/get-starknet-core";
import type { StarknetWalletAccount } from "@starknet-io/get-starknet-wallet-standard";
import type {
  WalletWithStarknetFeatures,
  StarknetFeatures,
} from "@starknet-io/get-starknet-wallet-standard/features";
import { StarknetWalletApi } from "@starknet-io/get-starknet-wallet-standard/features";

/**
 * WalletWithStarknetFeatures extends the base Wallet interface and requires:
 *
 * From Wallet interface:
 * - readonly version: WalletVersion ('1.0.0')
 * - readonly name: string
 * - readonly icon: WalletIcon (data URI with base64-encoded SVG/WebP/PNG/GIF)
 * - readonly chains: IdentifierArray (e.g., ['starknet:0x534e5f4d41494e'])
 * - readonly accounts: readonly StarknetWalletAccount[]
 * - readonly features: StarknetFeatures
 *
 * StarknetFeatures includes:
 * - StandardConnect feature with connect method
 * - StandardDisconnect feature with disconnect method
 * - StandardEvents feature with on method
 * - StarknetWalletApi feature with request method and walletVersion
 */

export default class ControllerWithStarknetFeatures
  implements WalletWithStarknetFeatures
{
  public controller: ControllerProvider;

  constructor(options: ControllerOptions = {}) {
    this.controller = new ControllerProvider(options);
  }

  get version(): "1.0.0" {
    return "1.0.0";
  }

  get name(): string {
    return this.controller.name;
  }

  get icon(): `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}` {
    return this.controller.icon as `data:image/svg+xml;base64,${string}`;
  }

  get chains(): (
    | "starknet:0x534e5f4d41494e"
    | "starknet:0x534e5f5345504f4c4941"
  )[] {
    return ["starknet:0x534e5f4d41494e", "starknet:0x534e5f5345504f4c4941"];
  }

  get accounts(): readonly StarknetWalletAccount[] {
    if (!this.controller.account) {
      return [];
    }

    // Convert Starknet WalletAccount to Wallet Standard WalletAccount metadata
    const walletStandardAccount: StarknetWalletAccount = {
      address: this.controller.account.address,
      publicKey: new Uint8Array(), // Starknet accounts don't expose public key directly
      chains: this.chains,
      features: [
        "standard:connect",
        "standard:disconnect",
        "standard:events",
        "starknet:walletApi",
      ],
      label: this.controller.name,
    };

    return [walletStandardAccount];
  }

  get features(): StarknetFeatures {
    return {
      [StandardConnect]: {
        version: "1.0.0" as const,
        connect: this.controllerConnect.bind(this) as StandardConnectMethod,
      },
      [StandardDisconnect]: {
        version: "1.0.0" as const,
        disconnect: this.controller.disconnect.bind(
          this.controller,
        ) as StandardDisconnectMethod,
      },
      [StandardEvents]: {
        version: "1.0.0" as const,
        on: this.controller.on.bind(this.controller) as StandardEventsOnMethod,
      },
      [StarknetWalletApi]: {
        version: "1.0.0" as const,
        walletVersion: this.controller.version,
        request: this.controller.request.bind(this.controller) as RequestFn,
      },
    };
  }

  private async controllerConnect(
    _input?: StandardConnectInput,
  ): Promise<StandardConnectOutput> {
    // The `silent` flag is not used by the controller currently
    await this.controller.connect();

    return {
      accounts: this.accounts,
    };
  }
}
