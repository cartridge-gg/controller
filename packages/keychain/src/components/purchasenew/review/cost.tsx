import {
  ArbitrumIcon,
  BaseIcon,
  Card,
  CardContent,
  CreditIcon,
  EthereumIcon,
  InfoIcon,
  OptimismIcon,
  SolanaIcon,
  StarknetIcon,
  Thumbnail,
} from "@cartridge/ui";
import { CostDetails } from "../types";
import {
  ExternalPlatform,
  ExternalWalletType,
  humanizeString,
} from "@cartridge/controller";
import { FeesTooltip } from "./tooltip";
import { OnchainFeesTooltip } from "./onchain-tooltip";
import type { OnchainQuote } from "@/context";

type PaymentRails = "stripe" | "crypto";
type PaymentUnit = "usdc" | "credits";

export const convertCentsToDollars = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

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
  if (rails === "crypto" && !walletType) {
    return;
  }

  if (!costDetails) {
    return <></>;
  }

  return (
    <Card className="gap-3">
      {rails === "crypto" && platform && (
        <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
          <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
            Purchase on <Network platform={platform} />
          </div>
        </CardContent>
      )}

      <div className="flex flex-row gap-3 h-[40px]">
        <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400 w-full">
          <div className="flex justify-between text-sm font-medium w-full">
            <div className="flex flex-row items-center gap-1">
              <span>Total</span>
              {costDetails.processingFeeInCents > 0 && (
                <FeesTooltip
                  trigger={<InfoIcon size="xs" />}
                  isStripe={rails === "stripe"}
                  defaultOpen={openFeesTooltip}
                  costDetails={costDetails}
                />
              )}
            </div>
            <span className="text-foreground-100">
              {convertCentsToDollars(costDetails.totalInCents)}
            </span>
          </div>
        </CardContent>
        <PaymentType unit={paymentUnit} />
      </div>
    </Card>
  );
}

/**
 * Onchain Cost Breakdown - for token-based payments directly to smart contracts
 */
export function OnchainCostBreakdown({
  quote,
  platform,
  openFeesTooltip = false,
}: {
  quote: OnchainQuote;
  platform?: ExternalPlatform;
  openFeesTooltip?: boolean;
}) {
  const { symbol, decimals } = quote.paymentTokenMetadata;

  // Format payment token amount with proper decimals
  const paymentAmount = Number(quote.totalCost) / Math.pow(10, decimals);

  // Format USDC equivalent if available
  const usdcEquivalent = quote.convertedPrice
    ? Number(quote.convertedPrice.amount) /
      Math.pow(10, quote.convertedPrice.tokenMetadata.decimals)
    : null;

  // Helper to format amount without trailing .00
  const formatAmount = (amount: number): string => {
    const formatted = amount.toFixed(2);
    return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
  };

  return (
    <Card className="gap-3">
      {platform && (
        <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
          <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
            Purchase on <Network platform={platform} />
          </div>
        </CardContent>
      )}

      <div className="flex flex-row gap-3 h-[40px]">
        <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400 w-full">
          <div className="flex justify-between text-sm font-medium w-full">
            <div className="flex flex-row items-center gap-1">
              <span>Total</span>
              <OnchainFeesTooltip
                trigger={<InfoIcon size="xs" />}
                defaultOpen={openFeesTooltip}
                quote={quote}
              />
            </div>
            <div className="flex items-center gap-2">
              {usdcEquivalent !== null && (
                <span className="text-foreground-400">
                  {formatAmount(paymentAmount)} {symbol}
                </span>
              )}
              <span className="text-foreground-100">
                {usdcEquivalent !== null
                  ? `$${formatAmount(usdcEquivalent)}`
                  : `${formatAmount(paymentAmount)} ${symbol}`}
              </span>
            </div>
          </div>
        </CardContent>
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

const Network = ({ platform }: { platform: ExternalPlatform }) => {
  const getNetworkIconComponent = (platform: ExternalPlatform) => {
    switch (platform) {
      case "starknet":
        return StarknetIcon;
      case "ethereum":
        return EthereumIcon;
      case "solana":
        return SolanaIcon;
      case "base":
        return BaseIcon;
      case "arbitrum":
        return ArbitrumIcon;
      case "optimism":
        return OptimismIcon;
      default:
        return null;
    }
  };

  const NetworkIcon = getNetworkIconComponent(platform);

  if (!NetworkIcon) {
    return <span>{humanizeString(platform)}</span>;
  }

  return (
    <>
      <NetworkIcon size="xs" className="inline-block" />
      {humanizeString(platform)}
    </>
  );
};
