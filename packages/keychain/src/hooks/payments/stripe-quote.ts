import { useMemo } from "react";
import { useConnection } from "../connection";
import { constants } from "starknet";
import {
  useStripeStarterpackQuoteQuery,
  StripeStarterpackQuoteInput,
} from "@/utils/api";
import { useStarterpackContext } from "@/context";
import { useOnchainPurchaseContext } from "@/context";
import { isOnchainStarterpack } from "@/context/starterpack/types";
import { getCurrentReferral } from "@/utils/referral";
import type { CostDetails } from "@/components/purchasenew/types";

export function useStripeStarterpackQuote({ enabled }: { enabled: boolean }) {
  const { controller, origin } = useConnection();
  const { registryAddress, bundleId, starterpackDetails } =
    useStarterpackContext();
  const { quantity } = useOnchainPurchaseContext();

  const isMainnet = useMemo(
    () => controller?.chainId() === constants.StarknetChainId.SN_MAIN,
    [controller],
  );

  const input = useMemo((): StripeStarterpackQuoteInput | null => {
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails))
      return null;
    if (!registryAddress) return null;

    const referralData = getCurrentReferral(origin);

    return {
      starterpackId: starterpackDetails.id.toString(),
      quantity,
      referral: referralData?.refAddress || referralData?.ref,
      referralGroup: referralData?.refGroup,
      registryAddress,
      ...(bundleId !== undefined && { clientPercentage: 0 }),
      isMainnet,
    };
  }, [
    starterpackDetails,
    registryAddress,
    quantity,
    origin,
    bundleId,
    isMainnet,
  ]);

  const { data, isLoading } = useStripeStarterpackQuoteQuery(
    { input: input! },
    { enabled: enabled && input !== null },
  );

  const costDetails = useMemo((): CostDetails | undefined => {
    if (!data) return undefined;
    const { pricing } = data.stripeStarterpackQuote;
    return {
      baseCostInCents: pricing.baseCostInCents,
      processingFeeInCents: pricing.processingFeeInCents,
      totalInCents: pricing.totalInCents,
    };
  }, [data]);

  return { costDetails, isLoading };
}
