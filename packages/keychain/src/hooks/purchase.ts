import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import { useStarterPack } from "@/hooks/starterpack";
import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "../components/funding/AmountSelection";
import { ExternalWallet } from "@cartridge/controller";
import {
  PurchaseState,
  PricingDetails,
  PurchaseCreditsProps,
} from "../components/purchase/types";

export function usePurchase({
  isSlot,
  starterpackDetails,
  initState = PurchaseState.SELECTION,
}: PurchaseCreditsProps) {
  const { controller, closeModal } = useConnection();
  const {
    isLoading: isLoadingWallets,
    error: walletError,
    connectWallet,
  } = useWallets();

  const {
    claim,
    isClaiming,
    isLoading: isStarterpackLoading,
  } = useStarterPack(starterpackDetails?.id);

  const [clientSecret, setClientSecret] = useState("");
  const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(
    null,
  );
  const [state, setState] = useState<PurchaseState>(initState);
  const [wholeCredits, setWholeCredits] = useState<number>(
    usdToCredits(starterpackDetails?.priceUsd || USD_AMOUNTS[0]),
  );
  const [selectedWallet, setSelectedWallet] = useState<ExternalWallet>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [displayError, setDisplayError] = useState<Error | null>(null);

  const {
    stripePromise,
    isLoading: isStripeLoading,
    error: stripeError,
    createPaymentIntent,
  } = useStripePayment({ isSlot });

  useEffect(() => {
    setDisplayError(walletError || stripeError);
  }, [walletError, stripeError]);

  const onAmountChanged = useCallback(
    (usdAmount: number) => {
      setDisplayError(null);
      setWholeCredits(usdToCredits(usdAmount));
    },
    [setWholeCredits],
  );

  const onClaim = useCallback(async () => {
    if (!controller) return;

    try {
      await claim();
      setState(PurchaseState.SUCCESS);
    } catch (e) {
      setDisplayError(e as Error);
    }
  }, [claim, controller]);

  const onCreditCard = useCallback(async () => {
    if (!controller) return;

    try {
      const paymentIntent = await createPaymentIntent(
        wholeCredits,
        controller.username(),
        starterpackDetails?.id,
      );
      setClientSecret(paymentIntent.clientSecret);
      setPricingDetails(paymentIntent.pricing);
      setState(PurchaseState.STRIPE_CHECKOUT);
    } catch (e) {
      setDisplayError(e as Error);
    }
  }, [wholeCredits, createPaymentIntent, controller, starterpackDetails?.id]);

  const onExternalConnect = useCallback(
    async (wallet: ExternalWallet) => {
      setDisplayError(null);
      setSelectedWallet(wallet);
      const res = await connectWallet(wallet.type);
      if (res?.success) {
        if (!res.account) {
          setDisplayError(
            new Error(
              `Connected to ${wallet.name} but no wallet address found`,
            ),
          );
          return;
        }
        setWalletAddress(res.account);
        setState(PurchaseState.CRYPTO_CHECKOUT);
      }
    },
    [connectWallet],
  );

  const onBack = useCallback(() => setState(PurchaseState.SELECTION), []);

  const onComplete = useCallback(() => setState(PurchaseState.SUCCESS), []);

  return {
    state,
    setState,
    clientSecret,
    pricingDetails,
    wholeCredits,
    selectedWallet,
    walletAddress,
    displayError,
    stripePromise,
    isStripeLoading,
    isLoadingWallets,
    isStarterpackLoading,
    isClaiming,
    closeModal,
    onAmountChanged,
    onClaim,
    onCreditCard,
    onExternalConnect,
    onBack,
    onComplete,
  };
}
