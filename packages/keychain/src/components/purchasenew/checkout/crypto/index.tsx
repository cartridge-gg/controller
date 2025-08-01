import { useNavigation, usePurchaseContext } from "@/context";
import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "../../receiving";
import { CostBreakdown } from "../../review/cost";
import { useCallback } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";

const CARTRIDGE_FEE = 0.025;

export function CryptoCheckout() {
  const {
    purchaseItems,
    usdAmount,
    isCryptoLoading,
    displayError,
    selectedWallet,
    onCrypto,
  } = usePurchaseContext();
  const { navigate } = useNavigation();
  const onPurchase = useCallback(async () => {
    await onCrypto();
    navigate("/purchase/pending", { reset: true });
  }, [onCrypto, navigate]);

  return (
    <>
      <HeaderInner
        title="Review Purchase"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        <Receiving title="Receiving" items={purchaseItems} />
      </LayoutContent>
      <LayoutFooter>
        <CostBreakdown
          rails={"crypto"}
          paymentUnit="usdc"
          walletType={selectedWallet?.type}
          costDetails={{
            baseCostInCents: usdAmount * 100,
            processingFeeInCents: usdAmount * 100 * CARTRIDGE_FEE,
            totalInCents: usdAmount * 100 * (1 + CARTRIDGE_FEE),
          }}
        />
        {displayError && (
          <ErrorAlert title="Error" description={displayError.message} />
        )}
        <Button onClick={onPurchase} isLoading={isCryptoLoading}>
          Purchase
        </Button>
      </LayoutFooter>
    </>
  );
}
