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
import { useCallback, useEffect } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";

export function CryptoCheckout() {
  const {
    purchaseItems,
    isCryptoLoading,
    displayError,
    selectedWallet,
    selectedPlatform,
    costDetails,
    onCrypto,
    clearError,
  } = usePurchaseContext();
  const { navigate } = useNavigation();
  const onPurchase = useCallback(async () => {
    await onCrypto();
    navigate("/purchase/pending", { reset: true });
  }, [onCrypto, navigate]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

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
          platform={selectedPlatform}
          walletType={selectedWallet?.type}
          costDetails={costDetails}
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
