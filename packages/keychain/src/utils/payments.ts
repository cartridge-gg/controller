import { ExternalPlatform } from "@cartridge/controller";
import {
  CreateLayerswapPaymentInput,
  LayerswapDestinationNetwork,
  PurchaseType,
} from "@cartridge/ui/utils/api/cartridge";
import { mapPlatformToLayerswapSourceNetwork } from "@/hooks/payments/crypto";

/**
 * Converts a starterpack ID to a CreateLayerswapPaymentInput object.
 *
 * @param starterpack The starterpack ID.
 * @param username The user's username.
 * @param platform The source platform for the payment.
 * @param isMainnet Whether the transaction is for mainnet or testnet.
 * @returns A CreateLayerswapPaymentInput object.
 */
export function starterPackToLayerswapInput(
  starterpack: string,
  username: string,
  platform: ExternalPlatform,
  isMainnet: boolean,
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
    purchaseType: PurchaseType.Starterpack,
    starterpackId: starterpack,
  };
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
