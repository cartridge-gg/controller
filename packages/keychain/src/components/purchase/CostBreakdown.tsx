import { Card, CardContent, Separator } from "@cartridge/ui-next";
import { PricingDetails } from ".";
import { ExternalWalletType } from "@cartridge/controller";
import { WALLET_CONFIG } from "./CryptoCheckout";

type PaymentRails = "stripe" | "crypto";

export function CostBreakdown({
  rails,
  price,
  walletType,
}: {
  rails: PaymentRails;
  price: PricingDetails;
  walletType?: ExternalWalletType;
}) {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (rails === "crypto" && !walletType) {
    return;
  }

  const getNetwork = () => {
    if (rails === "crypto" && walletType) {
      const NetworkIcon =
        WALLET_CONFIG[walletType as keyof typeof WALLET_CONFIG].networkIcon;

      return (
        <>
          <NetworkIcon size="xs" className="inline-block" />
          {WALLET_CONFIG[walletType as keyof typeof WALLET_CONFIG].network}
        </>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
        {rails === "stripe" && (
          <>
            <div className="flex justify-between">
              <div>Cost</div>
              <div>{formatCurrency(price.baseCostInCents)}</div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-1">Stripe Vendor Fee (2.9% + $0.30)</div>
              <div>{formatCurrency(price.processingFeeInCents)}</div>
            </div>
          </>
        )}

        {rails === "crypto" && (
          <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
            Purchase funds on {getNetwork()}
          </div>
        )}

        <Separator className="bg-background-200" />

        <div className="flex justify-between text-sm font-medium">
          <div>Total</div>
          <div className="text-foreground-100">
            {formatCurrency(price.totalInCents)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
