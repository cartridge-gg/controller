import { CoinflowPurchase } from "@coinflowlabs/react";
import { useEffect } from "react";
import {
  useNavigation,
  useStarterpackContext,
  useCreditPurchaseContext,
} from "@/context";
import { HeaderInner, CreditCardIcon, LayoutContent } from "@cartridge/ui";

export function CoinflowCheckout() {
  const { clearError } = useStarterpackContext();
  const { coinflowOrder, coinflowEnv } = useCreditPurchaseContext();
  const { navigate } = useNavigation();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  if (!coinflowOrder) {
    return null;
  }

  return (
    <>
      <HeaderInner
        title="Enter Payment Details"
        icon={<CreditCardIcon variant="solid" size="lg" />}
      />
      <LayoutContent className="p-0">
        <div className="h-full min-h-[400px]">
          <CoinflowPurchase
            merchantId={coinflowOrder.merchantId}
            sessionKey={coinflowOrder.sessionKey}
            jwtToken={coinflowOrder.jwtToken}
            env={coinflowEnv}
            onSuccess={() => {
              navigate("/purchase/pending", { reset: true });
            }}
          />
        </div>
      </LayoutContent>
    </>
  );
}
