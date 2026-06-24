import { useState, useCallback, useEffect } from "react";
import { useConnection } from "@/hooks/connection";
import useCoinflowPayment, {
  CoinflowStarterpackIntent,
  useCoinflowStarterpackQuote,
} from "@/hooks/payments/coinflow";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { useStarterpackContext } from "./use-starterpack-context";
import { useOnchainPurchaseContext } from "./use-onchain-purchase-context";
import { getCurrentReferral } from "@/utils/referral";
import { isOnchainStarterpack } from "./types";
import {
  CreditPurchaseContext,
  CreditPurchaseContextType,
  CreditPurchaseProviderProps,
} from "./credit-purchase-context";

export const CreditPurchaseProvider = ({
  children,
}: CreditPurchaseProviderProps) => {
  const { controller, origin } = useConnection();
  const {
    registryAddress,
    bundleId,
    starterpackId,
    starterpackDetails,
    setDisplayError,
  } = useStarterpackContext();
  const { quantity } = useOnchainPurchaseContext();

  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [coinflowIntent, setCoinflowIntent] = useState<
    CoinflowStarterpackIntent | undefined
  >();

  const {
    isLoading: isCoinflowLoading,
    error: coinflowError,
    createIntent: createCoinflowIntent,
    env: coinflowEnv,
  } = useCoinflowPayment();

  // Auto-fetch the Coinflow pricing quote whenever the relevant inputs change.
  // The hook handles its own enabled/disabled state and Ekubo swap pricing
  // for non-USDC starterpacks via the backend coinflowStarterpackQuote query.
  const referralData = getCurrentReferral(origin);
  const isOnchain =
    !!starterpackDetails && isOnchainStarterpack(starterpackDetails);
  const { data: coinflowQuote, isLoading: isCoinflowQuoteLoading } =
    useCoinflowStarterpackQuote({
      starterpackId: isOnchain
        ? (starterpackDetails as { id: number | string }).id.toString()
        : undefined,
      quantity,
      registryAddress,
      referral: referralData?.refAddress || referralData?.ref,
      referralGroup: referralData?.refGroup,
      ...(bundleId !== undefined && { clientPercentage: 0 }),
      enabled: isOnchain,
    });

  useEffect(() => {
    if (coinflowError) {
      setDisplayError(coinflowError);
    }
  }, [coinflowError]); // eslint-disable-line react-hooks/exhaustive-deps

  const onCreditCardPurchase = useCallback(async () => {
    if (!controller || !registryAddress) return;
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails)) {
      return;
    }

    try {
      if (!starterpackDetails.quote) {
        throw new Error("Quote not loaded yet");
      }

      const referralData = getCurrentReferral(origin);

      const intent = await createCoinflowIntent({
        starterpackId: starterpackDetails.id.toString(),
        quantity,
        referral: referralData?.refAddress || referralData?.ref,
        referralGroup: referralData?.refGroup,
        registryAddress,
        ...(bundleId !== undefined && { clientPercentage: 0 }),
      });
      setCoinflowIntent(intent);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    controller,
    origin,
    registryAddress,
    bundleId,
    starterpackDetails,
    quantity,
    createCoinflowIntent,
    setDisplayError,
  ]);

  useEffect(() => {
    setCoinflowIntent(undefined);
  }, [starterpackId]);

  const contextValue: CreditPurchaseContextType = {
    usdAmount,
    setUsdAmount,
    coinflowIntent,
    coinflowQuote,
    isCoinflowQuoteLoading,
    coinflowEnv,
    isCoinflowLoading,
    onCreditCardPurchase,
  };

  return (
    <CreditPurchaseContext.Provider value={contextValue}>
      {children}
    </CreditPurchaseContext.Provider>
  );
};
