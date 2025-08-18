import {
  Card,
  CardContent,
  CreditIcon,
  InfoIcon,
  Separator,
  Thumbnail,
} from "@cartridge/ui";
import { CostDetails } from "../types";
import {
  ExternalPlatform,
  ExternalWalletType,
  humanizeString,
} from "@cartridge/controller";
import { FeesTooltip } from "./tooltip";

type PaymentRails = "stripe" | "crypto";
type PaymentUnit = "usdc" | "credits";

export function CostBreakdown({
  rails,
  costDetails,
  walletType,
  platform,
  paymentUnit,
  openFeesTooltip = false,
}: {
  rails: PaymentRails;
  costDetails?: CostDetails;
  walletType?: ExternalWalletType;
  platform?: ExternalPlatform;
  paymentUnit?: PaymentUnit;
  openFeesTooltip?: boolean;
}) {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (rails === "crypto" && !walletType) {
    return;
  }

  if (!costDetails) {
    return <></>;
  }

  return (
    <Card className="gap-3">
      <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
        {rails === "crypto" && platform && (
          <>
            <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
              Purchase funds on {humanizeString(platform)}
            </div>
            <Separator className="bg-background-200" />
          </>
        )}

        <div className="flex justify-between text-xs font-medium">
          Cost
          <div>{formatCurrency(costDetails.baseCostInCents)}</div>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <div className="flex gap-2  text-xs font-medium">
            Fees
            <FeesTooltip
              trigger={<InfoIcon size="xs" />}
              isStripe={rails === "stripe"}
              defaultOpen={openFeesTooltip}
            />
          </div>
          <div>{formatCurrency(costDetails.processingFeeInCents)}</div>
        </div>
      </CardContent>
      <div className="flex flex-row gap-3 h-[40px]">
        <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400 w-full">
          <div className="flex justify-between text-sm font-medium w-full">
            Total
            <div className="text-foreground-100">
              {formatCurrency(costDetails.totalInCents)}
            </div>
          </div>
        </CardContent>
        <PaymentType unit={paymentUnit} />
      </div>
    </Card>
  );
}

const PaymentType = ({ unit }: { unit?: PaymentUnit }) => {
  if (!unit) {
    return <></>;
  }

  return (
    <CardContent className="flex items-center px-3 bg-background-200 gap-2 rounded-[4px] text-sm font-medium">
      <Thumbnail
        size="sm"
        icon={
          unit === "usdc" ? (
            "https://static.cartridge.gg/tokens/usdc.svg"
          ) : (
            <CreditIcon />
          )
        }
        variant="light"
        rounded
      />
      {unit.toUpperCase()}
    </CardContent>
  );
};
