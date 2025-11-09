import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
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
  teamId,
  starterpackDetails,
  initState = PurchaseState.SELECTION,
  onComplete,
}: PurchaseCreditsProps) {
  const { controller, closeModal } = useConnection();
  const {
    isLoading: isLoadingWallets,
    error: walletError,
    connectWallet,
  } = useWallets();

  const [clientSecret, setClientSecret] = useState("");
  const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(
    null,
  );
  const [state, setState] = useState<PurchaseState>(initState);
  const [wholeCredits, setWholeCredits] = useState<number>(
    usdToCredits(USD_AMOUNTS[0]),
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

  const onCreditCard = useCallback(async () => {
    if (!controller) return;

    try {
      const paymentIntent = await createPaymentIntent(
        wholeCredits,
        controller.username(),
        teamId,
        starterpackDetails?.id?.toString(),
      );
      setClientSecret(paymentIntent.clientSecret);
      setPricingDetails(paymentIntent.pricing);
      setState(PurchaseState.STRIPE_CHECKOUT);
    } catch (e) {
      setDisplayError(e as Error);
    }
  }, [
    wholeCredits,
    createPaymentIntent,
    controller,
    starterpackDetails?.id,
    teamId,
  ]);

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

  const onCompletePurchase = useCallback(() => {
    setState(PurchaseState.SUCCESS);
    onComplete?.();
  }, [onComplete]);

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
    closeModal,
    onAmountChanged,
    onCreditCard,
    onExternalConnect,
    onBack,
    onCompletePurchase,
  };
}
