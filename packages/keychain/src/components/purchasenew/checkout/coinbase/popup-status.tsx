import { useEffect } from "react";
import {
  Button,
  CoinbaseWalletColorIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
  TimesIcon,
} from "@cartridge/ui";
import { useNavigation, useOnchainPurchaseContext } from "@/context";
import { CoinbaseOnrampStatus } from "@/utils/api";

interface CoinbasePopupStatusProps {
  /** Overrides the default "go back one step" behavior. Used when hosted as a
   * takeover view (there's no previous history entry to pop). */
  onBack?: () => void;
}

export function CoinbasePopupStatus({ onBack }: CoinbasePopupStatusProps = {}) {
  const { orderStatus, popupClosed, paymentSuccess } =
    useOnchainPurchaseContext();
  const { navigate } = useNavigation();
  const isFailed = orderStatus === CoinbaseOnrampStatus.Failed;

  useEffect(() => {
    if (paymentSuccess || orderStatus === CoinbaseOnrampStatus.Completed) {
      navigate("/purchase/pending", { reset: true });
    }
  }, [paymentSuccess, orderStatus, navigate]);

  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <>
      <HeaderInner
        title="Apple Pay"
        description="via Coinbase"
        icon={<CoinbaseWalletColorIcon size="lg" />}
      />
      <LayoutContent className="p-4 flex flex-col items-center justify-center gap-6 pb-24">
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
        ) : popupClosed ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <TimesIcon size="lg" className="text-foreground-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground-100">
                Payment Window Closed
              </p>
              <p className="text-xs text-foreground-300 mt-1">
                The payment window was closed. Go back to try again.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <SpinnerIcon className="animate-spin" size="lg" />
            <div>
              <p className="text-sm font-semibold text-foreground-100">
                Complete in Popup
              </p>
              <p className="text-xs text-foreground-300 mt-1">
                Complete the payment in the popup window that opened.
              </p>
            </div>
          </div>
        )}
      </LayoutContent>
      {(isFailed || popupClosed) && (
        <LayoutFooter>
          <Button className="w-full" onClick={handleBack}>
            GO BACK
          </Button>
        </LayoutFooter>
      )}
    </>
  );
}
