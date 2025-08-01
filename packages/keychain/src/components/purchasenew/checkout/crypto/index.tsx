import { usePurchaseContext } from "@/context";
import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "../../receiving";
import { CostBreakdown } from "../../review/cost";
import { useCryptoPayment } from "@/hooks/payments/crypto";
import { useCallback } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";

const CARTRIDGE_FEE = 0.025;

export function CryptoCheckout() {
  return <CryptoCheckoutInner />;
}

export function CryptoCheckoutInner() {
  const { purchaseItems, usdAmount, selectedWallet, walletAddress, starterpackId } = usePurchaseContext();
  const { sendPayment, waitForPayment, error, isLoading } = useCryptoPayment();

  const handlePurchase = useCallback(async () => {
    if (!walletAddress || !selectedWallet) {
      return;
    }

    const paymentId = await sendPayment(walletAddress, 0, selectedWallet.platform!, undefined, starterpackId);
    await waitForPayment(paymentId);
  }, [sendPayment, selectedWallet, walletAddress, starterpackId]);

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
        {error && <ErrorAlert title="Error" description={error.message} />}
        <Button onClick={handlePurchase} isLoading={isLoading}>
          Purchase
        </Button>
      </LayoutFooter>
    </>
  );
}
