import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useConnection } from "@/hooks/connection";
import useCoinflowPayment, {
  CoinflowStarterpackIntent,
  CoinflowStarterpackQuote,
  useCoinflowStarterpackQuote,
} from "@/hooks/payments/coinflow";
import useCreditsPayment, {
  BundleCreditsQuote,
  CreditsBundleFulfillment,
  useBundleCreditsQuote,
} from "@/hooks/payments/credits";
import { useCreditBalance } from "@cartridge/controller-ui/utils";
import { CREDIT_AMOUNTS } from "@/components/funding/AmountSelection";
import { useStarterpackContext } from "./starterpack";
import { useOnchainPurchaseContext } from "./onchain-purchase";
import { getCurrentReferral } from "@/utils/referral";
import { isOnchainStarterpack } from "./types";

export interface CreditPurchaseContextType {
  // USD amount selection
  usdAmount: number;
  setUsdAmount: (amount: number) => void;

  // Coinflow state
  coinflowIntent: CoinflowStarterpackIntent | undefined;
  coinflowQuote: CoinflowStarterpackQuote | undefined;
  isCoinflowQuoteLoading: boolean;
  coinflowEnv: "prod" | "sandbox";
  isCoinflowLoading: boolean;

  // Credits (spend account credit balance) state
  creditsQuote: BundleCreditsQuote | undefined;
  isCreditsQuoteLoading: boolean;
  /** Quote rejection — PermissionDenied when the bundle is not approved for
   * credits; display its message and treat credits as unavailable. */
  creditsQuoteError: Error | undefined;
  /** Raw credit balance in 1e8-per-USD units (same unit as requiredCredits). */
  creditsBalance: bigint;
  refetchCreditsBalance: () => Promise<unknown>;
  hasSufficientCredits: boolean;
  isCreditsLoading: boolean;
  creditsFulfillment: CreditsBundleFulfillment | undefined;

  // Actions
  onCreditCardPurchase: () => Promise<void>;
  onCreditsPurchase: () => Promise<void>;
}

export const CreditPurchaseContext = createContext<
  CreditPurchaseContextType | undefined
>(undefined);

export interface CreditPurchaseProviderProps {
  children: ReactNode;
}

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

  const [usdAmount, setUsdAmount] = useState<number>(CREDIT_AMOUNTS[0]);
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
  const quoteInput = {
    starterpackId: isOnchain
      ? (starterpackDetails as { id: number | string }).id.toString()
      : undefined,
    quantity,
    registryAddress,
    referral: referralData?.refAddress || referralData?.ref,
    referralGroup: referralData?.refGroup,
    ...(bundleId !== undefined && { clientPercentage: 0 }),
    enabled: isOnchain,
  };
  const { data: coinflowQuote, isLoading: isCoinflowQuoteLoading } =
    useCoinflowStarterpackQuote(quoteInput);

  // Credits quote — same inputs, same backend pricing path as the purchase
  // mutation, so quote == charge. The backend also gates which bundles may be
  // bought with credits: unapproved ones reject with PermissionDenied, which
  // we surface (not auto-display) via creditsQuoteError.
  const {
    data: creditsQuote,
    isLoading: isCreditsQuoteLoading,
    error: creditsQuoteError,
  } = useBundleCreditsQuote(quoteInput);

  // Credit balance — raw 1e8-per-USD units, same unit as the quote's
  // requiredCredits, so the sufficiency check needs no conversion.
  const { balance: rawCreditBalance, refetch: refetchCreditsBalance } =
    useCreditBalance({
      username: controller?.username(),
      interval: undefined,
    });
  const creditsBalance = rawCreditBalance.value;
  const hasSufficientCredits = useMemo(() => {
    if (!creditsQuote) return false;
    return creditsBalance >= BigInt(creditsQuote.requiredCredits);
  }, [creditsQuote, creditsBalance]);

  const {
    isLoading: isCreditsLoading,
    error: creditsError,
    purchaseBundle,
  } = useCreditsPayment();
  const [creditsFulfillment, setCreditsFulfillment] = useState<
    CreditsBundleFulfillment | undefined
  >();

  useEffect(() => {
    if (coinflowError) {
      setDisplayError(coinflowError);
    }
    if (creditsError) {
      setDisplayError(creditsError);
    }
  }, [coinflowError, creditsError, setDisplayError]);

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
      // The success screen renders whichever result is set — drop a stale
      // credits fulfillment from an earlier attempt on this same bundle so
      // the card result wins.
      setCreditsFulfillment(undefined);
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

  // Spend the account's credit balance: the backend debits synchronously and
  // returns a PurchaseFulfillment to poll (credits are auto-refunded if
  // fulfillment terminally fails). Same input shape as the Coinflow intent.
  const onCreditsPurchase = useCallback(async () => {
    if (!controller || !registryAddress) return;
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails)) {
      return;
    }

    try {
      const referralData = getCurrentReferral(origin);

      const fulfillment = await purchaseBundle({
        starterpackId: starterpackDetails.id.toString(),
        quantity,
        referral: referralData?.refAddress || referralData?.ref,
        referralGroup: referralData?.refGroup,
        registryAddress,
        ...(bundleId !== undefined && { clientPercentage: 0 }),
      });
      // Inverse of the card path: a stale coinflow intent from an earlier
      // attempt must not shadow this credits result on the success screen.
      setCoinflowIntent(undefined);
      setCreditsFulfillment(fulfillment);
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
    purchaseBundle,
    setDisplayError,
  ]);

  useEffect(() => {
    setCoinflowIntent(undefined);
    setCreditsFulfillment(undefined);
  }, [starterpackId]);

  const contextValue: CreditPurchaseContextType = {
    usdAmount,
    setUsdAmount,
    coinflowIntent,
    coinflowQuote,
    isCoinflowQuoteLoading,
    coinflowEnv,
    isCoinflowLoading,
    creditsQuote,
    isCreditsQuoteLoading,
    creditsQuoteError: (creditsQuoteError as Error) ?? undefined,
    creditsBalance,
    refetchCreditsBalance,
    hasSufficientCredits,
    isCreditsLoading,
    creditsFulfillment,
    onCreditCardPurchase,
    onCreditsPurchase,
  };

  return (
    <CreditPurchaseContext.Provider value={contextValue}>
      {children}
    </CreditPurchaseContext.Provider>
  );
};

export const useCreditPurchaseContext = () => {
  const context = useContext(CreditPurchaseContext);
  if (!context) {
    throw new Error(
      "useCreditPurchaseContext must be used within CreditPurchaseProvider",
    );
  }
  return context;
};
