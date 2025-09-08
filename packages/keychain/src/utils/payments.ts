import { StarterPack, ExternalPlatform } from "@cartridge/controller";
import {
  CreateLayerswapPaymentInput,
  LayerswapDestinationNetwork,
  PurchaseType,
} from "@cartridge/ui/utils/api/cartridge";
import { num } from "starknet";
import { mapPlatformToLayerswapSourceNetwork } from "@/hooks/payments/crypto";
import {
  aggregateStarterPackCalls,
  calculateStarterPackPrice,
} from "./starterpack";
import Controller from "./controller";

/**
 * Converts a starterpack (ID or object) to a CreateLayerswapPaymentInput object.
 *
 * @param starterpack The starterpack ID or a StarterPack object.
 * @param username The user's username.
 * @param platform The source platform for the payment.
 * @param isMainnet Whether the transaction is for mainnet or testnet.
 * @param controller The controller instance.
 * @returns A CreateLayerswapPaymentInput object.
 */
export async function starterPackToLayerswapInput(
  starterpack: string | StarterPack,
  username: string,
  platform: ExternalPlatform,
  isMainnet: boolean,
  controller: Controller,
): Promise<CreateLayerswapPaymentInput> {
  const sourceNetwork = mapPlatformToLayerswapSourceNetwork(
    platform,
    isMainnet,
  );
  const destinationNetwork = isMainnet
    ? LayerswapDestinationNetwork.StarknetMainnet
    : LayerswapDestinationNetwork.StarknetSepolia;

  if (typeof starterpack === "string") {
    return {
      username,
      sourceNetwork,
      destinationNetwork,
      purchaseType: PurchaseType.Starterpack,
      starterpackId: starterpack,
    };
  } else {
    const calls = aggregateStarterPackCalls(starterpack);
    const signedExecution = await controller.signExecuteFromOutside(calls);
    const amount = calculateStarterPackPrice(starterpack);

    return {
      username,
      sourceNetwork,
      destinationNetwork,
      purchaseType: PurchaseType.OutsideExecution,
      outsideExecution: {
        address: controller.address(),
        execution: JSON.stringify(signedExecution.outside_execution),
        signature: signedExecution.signature,
        swap: {
          tokenAddress: isMainnet
            ? "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"
            : "0x04a762673b08014b8e7a969f94cc752a93b8ae209ace1aa01fea14a22f8a865c",
          amount: num.toHex(amount),
        },
      },
    };
  }
}

/**
 * Converts a credits purchase to a CreateLayerswapPaymentInput object.
 *
 * @param username The user's username.
 * @param platform The source platform for the payment.
 * @param isMainnet Whether the transaction is for mainnet or testnet.
 * @param wholeCredits The amount of credits to purchase.
 * @param teamId An optional team ID.
 * @returns A CreateLayerswapPaymentInput object.
 */
export function creditsPurchaseToLayerswapInput(
  username: string,
  starterpackId: string | undefined,
  platform: ExternalPlatform,
  isMainnet: boolean,
  wholeCredits: number,
  teamId?: string,
): CreateLayerswapPaymentInput {
  const sourceNetwork = mapPlatformToLayerswapSourceNetwork(
    platform,
    isMainnet,
  );
  const destinationNetwork = isMainnet
    ? LayerswapDestinationNetwork.StarknetMainnet
    : LayerswapDestinationNetwork.StarknetSepolia;

  return {
    username,
    sourceNetwork,
    destinationNetwork,
    purchaseType: PurchaseType.Credits,
    credits: {
      amount: wholeCredits,
      decimals: 0,
    },
    starterpackId,
    teamId,
  };
}
