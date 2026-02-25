import { useState, useEffect, useCallback } from "react";
import {
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
  Button,
  CoinbaseWalletColorIcon,
  ExternalIcon,
  cn,
  TimesIcon,
} from "@cartridge/ui";
import { useOnchainPurchaseContext } from "@/context";
import { useNavigation } from "@/context";
import { CoinbaseOnrampStatus } from "@cartridge/ui/utils/api/cartridge";

export function CoinbaseCheckout() {
  const {
    paymentLink,
    orderStatus,
    onCreateCoinbaseOrder,
    openPaymentPopup,
    stopPolling,
  } = useOnchainPurchaseContext();
  const { navigate } = useNavigation();
  const [showPolicies, setShowPolicies] = useState(true);
  const [popupOpened, setPopupOpened] = useState(false);

  // Create the order if we don't have a payment link yet
  useEffect(() => {
    if (!paymentLink) {
      onCreateCoinbaseOrder();
    }
  }, [paymentLink, onCreateCoinbaseOrder]);

  // Navigate to pending when order is completed
  useEffect(() => {
    if (orderStatus === CoinbaseOnrampStatus.Completed) {
      navigate("/purchase/pending", { reset: true });
    }
  }, [orderStatus, navigate]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleContinue = useCallback(() => {
    setShowPolicies(false);
    // Open popup immediately after accepting policies
    if (paymentLink && !popupOpened) {
      openPaymentPopup();
      setPopupOpened(true);
    }
  }, [paymentLink, popupOpened, openPaymentPopup]);

  const handleRetryPopup = useCallback(() => {
    if (paymentLink) {
      openPaymentPopup();
      setPopupOpened(true);
    }
  }, [paymentLink, openPaymentPopup]);

  const isFailed = orderStatus === CoinbaseOnrampStatus.Failed;

  return (
    <>
      {/* Policies Screen */}
      <div className={cn("flex flex-col h-full", !showPolicies && "hidden")}>
        <HeaderInner
          title={
            <div className="flex flex-col">
              <span className="text-lg font-bold">Coinbase</span>
              <span className="text-xs text-foreground-300">Policies</span>
            </div>
          }
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
        <LayoutContent className="p-4 flex flex-col gap-4">
          <div className="bg-[#181C19] border border-background-200 p-4 rounded-[4px] text-xs text-foreground-300">
            By clicking 'Continue' you are agreeing to the following Coinbase
            policies.
          </div>

          <div className="flex flex-col gap-3">
            <PolicyLink
              label="Guest Checkout Terms of Service"
              href="https://www.coinbase.com/legal/guest-checkout/us"
            />
            <PolicyLink
              label="User Agreement"
              href="https://www.coinbase.com/legal/user_agreement"
            />
            <PolicyLink
              label="Privacy Policy"
              href="https://www.coinbase.com/legal/privacy"
            />
          </div>
        </LayoutContent>
        <LayoutFooter>
          <Button
            className="w-full"
            onClick={handleContinue}
            disabled={!paymentLink}
          >
            {paymentLink ? "CONTINUE" : "LOADING..."}
          </Button>
        </LayoutFooter>
      </div>

      {/* Payment Status Screen */}
      <div
        className={cn(
          "flex flex-col h-full",
          showPolicies && "invisible absolute inset-0 -z-10",
        )}
      >
        <HeaderInner
          title={
            <div className="flex flex-col">
              <span className="text-lg font-bold">Apple Pay</span>
              <span className="text-xs text-foreground-300">via Coinbase</span>
            </div>
          }
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
        <LayoutContent className="p-4 flex flex-col items-center justify-center gap-6">
          {isFailed ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TimesIcon size="lg" className="text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground-100">
                  Payment Failed
                </p>
                <p className="text-xs text-foreground-300 mt-1">
                  The payment could not be completed. Please try again.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <SpinnerIcon className="animate-spin" size="lg" />
              <div>
                <p className="text-sm font-semibold text-foreground-100">
                  Waiting for Payment
                </p>
                <p className="text-xs text-foreground-300 mt-1">
                  Complete the payment in the popup window that opened.
                </p>
                <p className="text-xs text-foreground-400 mt-2">
                  If the popup didn't open or was closed, click below to reopen
                  it.
                </p>
              </div>
            </div>
          )}
        </LayoutContent>
        <LayoutFooter>
          {isFailed ? (
            <Button className="w-full" onClick={handleRetryPopup}>
              TRY AGAIN
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleRetryPopup}
              disabled={!paymentLink}
            >
              REOPEN PAYMENT WINDOW
            </Button>
          )}
        </LayoutFooter>
      </div>
    </>
  );
}

function PolicyLink({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center w-full justify-between p-3 border border-background-200 rounded-[4px] text-sm text-foreground-100">
        <span className="text-[#DEB06B]">{label}</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-[4px] border border-background-200 hover:bg-background-200 transition-colors"
      >
        <ExternalIcon size="sm" className="text-foreground-300" />
      </a>
    </div>
  );
}
