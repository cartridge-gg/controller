import { ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import {
  Button,
  Card,
  CardDescription,
  CheckIcon,
  CreditCardIcon,
  DepositIcon,
  InfoIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { Elements } from "@stripe/react-stripe-js";
import { type Appearance, loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AmountSelection } from "../AmountSelection";
import CheckoutForm from "./StripeCheckout";
import { DEFAULT_AMOUNT } from "../constants";
import { CryptoCheckout, walletIcon } from "./CryptoCheckout";
import { ExternalWallet } from "@cartridge/controller";
import { Balance, BalanceType } from "../Balance";

export enum PurchaseState {
  SELECTION = 0,
  STRIPE_CHECKOUT = 1,
  CRYPTO_CHECKOUT = 2,
  SUCCESS = 3,
}

export type PurchaseCreditsProps = {
  isSlot?: boolean;
  wallets?: ExternalWallet[];
  initState?: PurchaseState;
  onBack?: () => void;
};

export type PricingDetails = {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
};

export type StripeResponse = {
  clientSecret: string;
  pricing: PricingDetails;
};

export function PurchaseCredits({
  onBack,
  wallets,
  initState = PurchaseState.SELECTION,
}: PurchaseCreditsProps) {
  const { controller, closeModal } = useConnection();
  const {
    wallets: detectedWallets,
    isLoading: isLoadingWallets,
    isConnecting,
    error: walletError,
    connectWallet,
  } = useWallets();

  const [clientSecret, setClientSecret] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(
    null,
  );
  const [state, setState] = useState<PurchaseState>(initState);
  const [creditsAmount, setCreditsAmount] = useState<number>(DEFAULT_AMOUNT);
  const [selectedWallet, setSelectedWallet] = useState<ExternalWallet>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [displayError, setDisplayError] = useState<Error | null>(null);
  const stripePromise = useMemo(
    () => loadStripe(import.meta.env.VITE_STRIPE_API_PUBKEY),
    [],
  );

  useEffect(() => {
    setDisplayError(walletError);
  }, [walletError]);

  const availableWallets = useMemo(
    () => wallets ?? detectedWallets,
    [wallets, detectedWallets],
  );

  const onAmountChanged = useCallback(
    (amount: number) => {
      setDisplayError(null);
      setCreditsAmount(amount);
    },
    [setCreditsAmount],
  );

  const createPaymentIntent = useCallback(async () => {
    if (!controller) {
      return;
    }

    setIsProcessingPayment(true);
    setDisplayError(null);

    try {
      const res = await fetch(import.meta.env.VITE_STRIPE_PAYMENT!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: creditsAmount,
          username: controller.username(),
          purchaseType: "CREDITS",
        }),
      });
      if (!res.ok) {
        setDisplayError(new Error("Payment intent endpoint failure"));
        return;
      }
      const data: StripeResponse = await res.json();
      setClientSecret(data.clientSecret);
      setPricingDetails(data.pricing);
      setState(PurchaseState.STRIPE_CHECKOUT);
    } catch (e) {
      setDisplayError(e as unknown as Error);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [controller, creditsAmount]);

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
      } else if (res && !res.success) {
        // Error is already set by the context hook
        // setDisplayError(new Error(res.error));
      } else if (!res) {
        // Error case where connectWallet returned null (handled by context)
      }
    },
    [connectWallet],
  );

  const title = useMemo(() => {
    switch (state) {
      case PurchaseState.SELECTION:
        return "Purchase Credits";
      case PurchaseState.STRIPE_CHECKOUT:
        return "Credit Card";
      case PurchaseState.SUCCESS:
        return "Purchase Complete";
    }
  }, [state]);

  const appearance = {
    theme: "flat",
    variables: {
      colorBackground: "#1E221F",
      colorText: "#505050",
      colorTextPlaceholder: "#505050",
      borderRadius: "4px",
      focusBoxShadow: "none",
    },
    rules: {
      ".Input": {
        border: "1px solid #242824",
        color: "#FFFFFF",
        padding: "14px",
      },
    },
  } as Appearance;

  if (state === PurchaseState.STRIPE_CHECKOUT) {
    return (
      <Elements
        options={{ clientSecret, appearance, loader: "auto" }}
        stripe={stripePromise}
      >
        <CheckoutForm
          price={pricingDetails!}
          onBack={() => setState(PurchaseState.SELECTION)}
          onComplete={() => setState(PurchaseState.SUCCESS)}
        />
      </Elements>
    );
  }

  if (state === PurchaseState.CRYPTO_CHECKOUT) {
    return (
      <CryptoCheckout
        walletAddress={walletAddress!}
        selectedWallet={selectedWallet!}
        creditsAmount={creditsAmount}
        onBack={() => setState(PurchaseState.SELECTION)}
        onComplete={() => setState(PurchaseState.SUCCESS)}
      />
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        className="p-6"
        title={title}
        icon={
          state === PurchaseState.SELECTION ? (
            <DepositIcon variant="solid" size="lg" />
          ) : (
            <CheckIcon size="lg" />
          )
        }
        onBack={() => {
          switch (state) {
            case PurchaseState.SUCCESS:
              return;
            case PurchaseState.SELECTION:
              onBack?.();
              break;
            default:
              setState(PurchaseState.SELECTION);
          }
        }}
      />
      <LayoutContent className="gap-6 px-6">
        {state === PurchaseState.SELECTION && (
          <AmountSelection
            amount={creditsAmount}
            onChange={onAmountChanged}
            lockSelection={isProcessingPayment || isLoadingWallets}
            enableCustom
          />
        )}
        {state === PurchaseState.SUCCESS && (
          <Balance types={[BalanceType.CREDITS]} />
        )}
      </LayoutContent>

      <LayoutFooter>
        {displayError && (
          <ErrorAlert
            variant="error"
            title="Purchase Alert"
            description={displayError.message}
          />
        )}

        {state !== PurchaseState.SUCCESS && (
          <Card className="bg-background-100 border border-background-200 p-3">
            <CardDescription className="flex flex-row items-start gap-3">
              <InfoIcon
                size="sm"
                className="text-foreground-200 flex-shrink-0"
              />
              <p className="text-foreground-200 font-normal text-xs">
                Credits can be used to purchase items or pay for network fees.
                They cannot be transferred or refunded.
              </p>
            </CardDescription>
          </Card>
        )}

        {state === PurchaseState.SUCCESS && isIframe() && (
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        )}
        {state === PurchaseState.SELECTION && (
          <>
            <Button
              className="flex-1"
              isLoading={isProcessingPayment}
              onClick={createPaymentIntent}
              disabled={isLoadingWallets}
            >
              <CreditCardIcon
                size="sm"
                variant="solid"
                className="text-background-100 flex-shrink-0"
              />
              <span>Credit Card</span>
            </Button>
            <div className="flex flex-row gap-4 mt-2">
              {availableWallets.map((wallet: ExternalWallet) => {
                return (
                  <Button
                    key={wallet.type}
                    className="flex-1"
                    variant="secondary"
                    isLoading={
                      isConnecting && wallet.type === selectedWallet?.type
                    }
                    disabled={
                      !wallet.available ||
                      isConnecting ||
                      isProcessingPayment ||
                      isLoadingWallets
                    }
                    onClick={async () => onExternalConnect(wallet)}
                  >
                    {walletIcon(wallet, true)}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}
