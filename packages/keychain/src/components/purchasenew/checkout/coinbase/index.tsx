import { useState, useEffect } from "react";
import {
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
  Button,
  CoinbaseWalletColorIcon,
  ExternalIcon,
  cn,
} from "@cartridge/ui";
import { useOnchainPurchaseContext } from "@/context";

export function CoinbaseCheckout() {
  const { paymentLink, onCreateCoinbaseOrder } = useOnchainPurchaseContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPolicies, setShowPolicies] = useState(true);

  useEffect(() => {
    if (!paymentLink) {
      onCreateCoinbaseOrder();
    }
  }, [paymentLink, onCreateCoinbaseOrder]);

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
            By clicking ‘Continue’ you are agreeing to the following Coinbase
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
          <Button className="w-full" onClick={() => setShowPolicies(false)}>
            CONTINUE
          </Button>
        </LayoutFooter>
      </div>

      <div
        className={cn(
          "flex flex-col h-full",
          showPolicies && "invisible absolute inset-0 -z-10",
        )}
      >
        <LayoutContent className="p-0 overflow-hidden relative bg-[#121212]">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F1410] z-10">
              <SpinnerIcon className="animate-spin" size="lg" />
            </div>
          )}
          {paymentLink ? (
            <div className="h-full w-full px-10 flex justify-center">
              <iframe
                src={paymentLink}
                className="h-full w-full max-w-[440px] border-none"
                allow="payment"
                title="Coinbase Onramp"
                onLoad={() => setIsLoaded(true)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <SpinnerIcon className="animate-spin" size="lg" />
            </div>
          )}
        </LayoutContent>
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
