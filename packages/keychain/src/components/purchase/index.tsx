import { ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import {
  Button,
  Card,
  CardDescription,
  CreditCardIcon,
  InfoIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  SparklesIcon,
  TagIcon,
} from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { Elements } from "@stripe/react-stripe-js";
import { type Appearance } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AmountSelection, USD_AMOUNTS } from "../funding/AmountSelection";
import CheckoutForm from "./StripeCheckout";
import { CryptoCheckout, walletIcon } from "./CryptoCheckout";
import { ExternalWallet } from "@cartridge/controller";
import { Balance, BalanceType } from "./Balance";
import {
  MintAllowance,
  StarterPackDetails,
  useStarterPack,
} from "@/hooks/starterpack";
import { StarterPackContent } from "../starterpack";
import { PurchaseType } from "@/hooks/payments/crypto";
import { Receiving } from "../starterpack/receiving";
import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";

export enum PurchaseState {
  SELECTION = 0,
  STRIPE_CHECKOUT = 1,
  CRYPTO_CHECKOUT = 2,
  SUCCESS = 3,
}

export type PurchaseCreditsProps = {
  isSlot?: boolean;
  wallets?: ExternalWallet[];
  type: PurchaseType;
  starterpackDetails?: StarterPackDetails;
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

// TODO: I know this is terrible... refactor soon, separate product selection and checkout
export function Purchase({
  onBack,
  wallets,
  type,
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

  const { claim } = useStarterPack(starterpackDetails?.id);

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
    if (!controller) {
      return;
    }

    try {
      await claim();
      setState(PurchaseState.SUCCESS);
    } catch (e) {
      setDisplayError(e as Error);
    }
  }, [claim, controller]);

  const onCreditCard = useCallback(async () => {
    if (!controller) {
      return;
    }

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
  }, [wholeCredits, createPaymentIntent]);

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
        return type === PurchaseType.CREDITS
          ? "Purchase Credits"
          : (starterpackDetails?.name ?? "Purchase Starter Pack");
      case PurchaseState.STRIPE_CHECKOUT:
        return "Credit Card";
      case PurchaseState.SUCCESS:
        return "Purchase Complete";
    }
  }, [state, starterpackDetails]);

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
        wholeCredits={wholeCredits}
        starterpackDetails={starterpackDetails}
        onBack={() => setState(PurchaseState.SELECTION)}
        onComplete={() => setState(PurchaseState.SUCCESS)}
      />
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        title={title}
        onBack={() => {
          switch (state) {
            case PurchaseState.SUCCESS:
              return;
            case PurchaseState.SELECTION:
              onBack?.();
              closeModal();
              break;
            default:
              setState(PurchaseState.SELECTION);
          }
        }}
        right={
          state === PurchaseState.SELECTION &&
          starterpackDetails?.supply !== undefined ? (
            <Supply amount={starterpackDetails!.supply} />
          ) : undefined
        }
      />
      <LayoutContent>
        {state === PurchaseState.SELECTION &&
          ((type === PurchaseType.CREDITS && (
            <AmountSelection
              onChange={onAmountChanged}
              lockSelection={isStripeLoading || isLoadingWallets}
              enableCustom
            />
          )) ||
            (type === PurchaseType.STARTERPACK && (
              <StarterPackContent
                mintAllowance={starterpackDetails?.mintAllowance}
                starterpackItems={starterpackDetails?.starterPackItems}
              />
            )))}
        {state === PurchaseState.SUCCESS &&
          (starterpackDetails ? (
            <Receiving
              title="Received"
              items={starterpackDetails?.starterPackItems}
            />
          ) : (
            <Balance types={[BalanceType.CREDITS]} />
          ))}
      </LayoutContent>

      <LayoutFooter>
        {displayError && (
          <ErrorAlert
            variant="error"
            title="Purchase Alert"
            description={displayError.message}
          />
        )}

        {state !== PurchaseState.SUCCESS && type === PurchaseType.CREDITS && (
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
          <PurchaseActions
            starterpackDetails={starterpackDetails}
            isStripeLoading={isStripeLoading}
            selectedWallet={selectedWallet}
            wallets={wallets}
            mintAllowance={starterpackDetails?.mintAllowance}
            onClaim={onClaim}
            onCreditCard={onCreditCard}
            onExternalConnect={onExternalConnect}
          />
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}

const PurchaseActions = ({
  starterpackDetails,
  isStripeLoading,
  selectedWallet,
  mintAllowance,
  wallets,
  onClaim,
  onCreditCard,
  onExternalConnect,
}: {
  starterpackDetails?: StarterPackDetails;
  isStripeLoading: boolean;
  selectedWallet?: ExternalWallet;
  mintAllowance?: MintAllowance;
  wallets?: ExternalWallet[];
  onClaim: () => void;
  onCreditCard: () => void;
  onExternalConnect: (wallet: ExternalWallet) => void;
}) => {
  const {
    isConnecting,
    isLoading: isLoadingWallets,
    wallets: detectedWallets,
  } = useWallets();

  const { isClaiming, isLoading: isStarterpackLoading } = useStarterPack(
    starterpackDetails?.id,
  );

  // Only show phantom for now as Solana is the only supported network
  const availableWallets = useMemo(() => {
    const list = wallets ?? detectedWallets;
    const phantom = list.find((w) => w.type === "phantom");
    return phantom ? [phantom] : [];
  }, [wallets, detectedWallets]);

  const isOutOfStock = () => {
    if (starterpackDetails?.supply !== undefined) {
      return starterpackDetails.supply <= 0;
    }
    return false;
  };

  if (isStarterpackLoading) {
    return <></>;
  }

  if (mintAllowance && mintAllowance.count >= mintAllowance.limit) {
    return (
      <Button className="flex-1" disabled>
        Limit Reached
      </Button>
    );
  }

  // Show claim if free
  if (starterpackDetails?.priceUsd === 0) {
    return (
      <Button className="flex-1" isLoading={isClaiming} onClick={onClaim}>
        <SparklesIcon size="sm" variant="solid" />
        Claim
      </Button>
    );
  }

  return (
    <>
      {isOutOfStock() ? (
        <Button className="flex-1" disabled>
          Check again soon
        </Button>
      ) : (
        <>
          <Button
            className="flex-1"
            isLoading={isStripeLoading}
            onClick={onCreditCard}
            disabled={isLoadingWallets}
          >
            <CreditCardIcon
              size="sm"
              variant="solid"
              className="text-background-100 flex-shrink-0"
            />
            <span>Credit Card</span>
          </Button>
          <div className="flex flex-row gap-4">
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
                    isStripeLoading ||
                    isLoadingWallets
                  }
                  onClick={async () => onExternalConnect(wallet)}
                >
                  {walletIcon(wallet, true)}{" "}
                  {availableWallets.length < 2 && wallet.type}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

const Supply = ({ amount }: { amount: number }) => {
  const color = () => {
    if (amount <= 0) {
      return "text-destructive-100";
    }

    return `text-primary-100`;
  };

  return (
    <div
      className={`flex gap-1 py-[2px] px-[8px] rounded-full bg-background-200 text-sm font-semibold ${color()}`}
    >
      {amount > 0 ? (
        <>
          <TagIcon size="sm" variant="solid" /> {amount} left
        </>
      ) : (
        <>Out of stock</>
      )}
    </div>
  );
};
