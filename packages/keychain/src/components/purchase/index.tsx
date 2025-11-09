import { ErrorAlert } from "@/components/ErrorAlert";
import {
  Button,
  Card,
  CardDescription,
  InfoIcon,
  LayoutContent,
  LayoutFooter,
  HeaderInner,
} from "@cartridge/ui";
import { isIframe } from "@cartridge/ui/utils";
import { Elements } from "@stripe/react-stripe-js";
import { type Appearance } from "@stripe/stripe-js";
import { useMemo } from "react";
import CheckoutForm from "./StripeCheckout";
import { PurchaseType } from "@cartridge/ui/utils/api/cartridge";
import { PaymentMethod } from "./PaymentMethod";
import { PurchaseContent } from "./PurchaseContent";
import { usePurchase } from "@/hooks/purchase";
import { PurchaseState, PurchaseCreditsProps } from "./types";

export { PurchaseState } from "./types";
export type {
  PurchaseCreditsProps,
  PricingDetails,
  StripeResponse,
} from "./types";

export function Purchase(props: PurchaseCreditsProps) {
  const {
    state,
    clientSecret,
    pricingDetails,
    selectedWallet,
    displayError,
    stripePromise,
    isStripeLoading,
    isLoadingWallets,
    closeModal,
    onAmountChanged,
    onCreditCard,
    onExternalConnect,
    onCompletePurchase,
  } = usePurchase(props);

  const { wallets, type, starterpackDetails, title: propsTitle } = props;

  const title = useMemo(() => {
    if (propsTitle) {
      return propsTitle;
    }

    switch (state) {
      case PurchaseState.SELECTION:
        return type === PurchaseType.Credits
          ? "Purchase Credits"
          : (starterpackDetails?.name ?? "Purchase Starter Pack");
      case PurchaseState.STRIPE_CHECKOUT:
        return "Credit Card";
      case PurchaseState.SUCCESS:
        return "Purchase Complete";
    }
  }, [state, starterpackDetails, type, propsTitle]);

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
        <CheckoutForm price={pricingDetails!} onComplete={onCompletePurchase} />
      </Elements>
    );
  }

  // const isCloseable = isSlot
  //   ? false
  //   : state === PurchaseState.SELECTION || state === PurchaseState.SUCCESS;

  return (
    <>
      <HeaderInner title={title} hideIcon />
      <LayoutContent>
        <PurchaseContent
          state={state}
          type={type}
          isStripeLoading={isStripeLoading}
          isLoadingWallets={isLoadingWallets}
          onAmountChanged={onAmountChanged}
        />
      </LayoutContent>

      <LayoutFooter>
        {displayError && (
          <ErrorAlert
            variant="error"
            title="Purchase Error"
            description={displayError.message}
          />
        )}

        {state !== PurchaseState.SUCCESS && type === PurchaseType.Credits && (
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
          <PaymentMethod
            starterpackDetails={starterpackDetails}
            isStripeLoading={isStripeLoading}
            selectedWallet={selectedWallet}
            wallets={wallets}
            onCreditCard={onCreditCard}
            onExternalConnect={onExternalConnect}
          />
        )}
      </LayoutFooter>
    </>
  );
}
