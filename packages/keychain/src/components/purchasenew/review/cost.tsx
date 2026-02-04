import {
  ArbitrumIcon,
  BaseIcon,
  Card,
  CardContent,
  CreditIcon,
  EthereumIcon,
  InfoIcon,
  OptimismIcon,
  Select,
  SelectContent,
  SelectItem,
  SolanaIcon,
  Spinner,
  StarknetIcon,
  Thumbnail,
  TokenSelectHeader,
} from "@cartridge/ui";
import { CostDetails } from "../types";
import {
  ExternalPlatform,
  ExternalWalletType,
  humanizeString,
} from "@cartridge/controller";
import { FeesTooltip } from "./tooltip";
import { OnchainFeesTooltip } from "./onchain-tooltip";
import type { Quote } from "@/context";
import { useCallback, useMemo, useEffect } from "react";
import { useOnchainPurchaseContext } from "@/context";
import { num } from "starknet";

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
  quote: Quote;
  platform?: ExternalPlatform;
  openFeesTooltip?: boolean;
}) {
  const {
    depositAmount: layerswapDepositAmount,
    layerswapFees,
    availableTokens,
    selectedPlatform,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    isTokenSelectionLocked,
    isFetchingConversion,
    feeEstimationError,
    quantity,
    isApplePaySelected,
    coinbaseQuote,
    isFetchingCoinbaseQuote,
  } = useOnchainPurchaseContext();
  const { decimals } = quote.paymentTokenMetadata;

  // Get default token (matching quote if available) or fallback to the first available token
  const defaultToken =
    availableTokens.find(
      (t) => num.toHex(t.address) === num.toHex(quote.paymentToken),
    ) || availableTokens[0];

  // Use selectedToken or fallback to defaultToken for display
  const displayToken = selectedToken || defaultToken;

  // Auto-select defaultToken if none is selected (for initial load)
  useEffect(() => {
    if (defaultToken && !selectedToken) {
      setSelectedToken(defaultToken);
    }
  }, [defaultToken, selectedToken, setSelectedToken]);

  // Check if payment token matches selected token (use selectedToken, not displayToken)
  const isPaymentTokenSameAsSelected = useMemo(() => {
    if (!selectedToken || !quote) return false;
    return num.toHex(quote.paymentToken) === num.toHex(selectedToken.address);
  }, [selectedToken, quote]);

  // Format payment token amount with proper decimals and multiply by quantity
  const paymentAmount =
    (Number(quote.totalCost) / Math.pow(10, decimals)) * quantity;

  // Format converted equivalent if available and multiply by quantity
  const convertedEquivalent = convertedPrice
    ? Number(convertedPrice.amount) /
      Math.pow(10, convertedPrice.tokenMetadata.decimals)
    : null;

  // Check if using Layerswap (non-starknet platform)
  const isUsingLayerswap = selectedPlatform && selectedPlatform !== "starknet";

  // Format layerswap deposit amount (includes fees)
  const layerswapTotal =
    isUsingLayerswap && layerswapDepositAmount && convertedPrice
      ? layerswapDepositAmount /
        Math.pow(10, convertedPrice.tokenMetadata.decimals)
      : null;

  // Helper to format amount, handling small numbers properly
  const formatAmount = (amount: number): string => {
    // Handle zero
    if (amount === 0) return "0";

    // For very small numbers (< 0.01), show up to 6 decimal places
    if (amount < 0.01) {
      // Use toFixed with enough precision, then remove trailing zeros
      const formatted = amount.toFixed(6);
      // Remove trailing zeros and decimal point if needed
      return formatted.replace(/\.?0+$/, "") || "0";
    }

    // For numbers >= 0.01, use standard 2 decimal formatting
    const formatted = amount.toFixed(2);
    return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
  };

  const handleTokenChange = useCallback(
    (address: string) => {
      const token = availableTokens.find(
        (t) => t.address.toLowerCase() === address.toLowerCase(),
      );
      if (token) {
        setSelectedToken(token);
      }
    },
    [availableTokens, setSelectedToken],
  );

  return (
    <Card className="gap-3">
      {platform && (
        <CardContent className="flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
          <div className="text-foreground-400 font-normal text-xs flex flex-row items-center gap-1">
            Purchase on <Network platform={platform} />
          </div>
        </CardContent>
      )}

      <div className="flex flex-row gap-3 h-[40px] text-foreground-300">
        <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs w-full">
          <div className="flex justify-between text-sm font-medium w-full">
            <div className="flex flex-row items-center gap-1">
              <span>Total</span>
              <OnchainFeesTooltip
                trigger={<InfoIcon size="xs" />}
                defaultOpen={openFeesTooltip}
                quote={quote}
                quantity={quantity}
                layerswapFees={isUsingLayerswap ? layerswapFees : undefined}
                coinbaseQuote={isApplePaySelected ? coinbaseQuote : undefined}
              />
            </div>
            {isFetchingConversion || isFetchingCoinbaseQuote ? (
              <Spinner />
            ) : (
              <div className="flex items-center gap-1.5">
                {isApplePaySelected ? (
                  coinbaseQuote ? (
                    <span className="text-foreground-100">
                      {`$${Number(coinbaseQuote.paymentTotal.amount).toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="text-foreground-400">—</span>
                  )
                ) : isUsingLayerswap ? (
                  feeEstimationError ? (
                    <span className="text-foreground-400">—</span>
                  ) : layerswapTotal !== null && displayToken ? (
                    <span className="text-foreground-100">
                      {formatAmount(layerswapTotal)}
                    </span>
                  ) : (
                    <Spinner />
                  )
                ) : isPaymentTokenSameAsSelected ? (
                  <span className="text-foreground-300">
                    {formatAmount(paymentAmount)}
                  </span>
                ) : (
                  convertedEquivalent !== null &&
                  displayToken && (
                    <span className="text-foreground-100">
                      {formatAmount(convertedEquivalent)}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </CardContent>
        <Select
          value={displayToken?.address ?? ""}
          onValueChange={handleTokenChange}
          disabled={availableTokens.length <= 1 || isTokenSelectionLocked}
        >
          <TokenSelectHeader className="h-10 w-fit rounded flex gap-2 items-center p-2" />
          <SelectContent viewPortClassName="gap-0 bg-background-100 flex flex-col gap-px">
            {availableTokens.map((token) => (
              <SelectItem
                key={token.address}
                simplified
                value={token.address}
                data-active={token.address === displayToken?.address}
                className="h-10 group bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-100 cursor-pointer data-[active=true]:bg-background-200 data-[active=true]:hover:bg-background-300 data-[active=true]:text-foreground-100 rounded-none"
              >
                <div className="flex items-center gap-2">
                  {token.icon ? (
                    <Thumbnail
                      icon={token.icon}
                      rounded
                      size="sm"
                      variant="light"
                      className="group-hover:bg-background-400"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm">{token.symbol}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
