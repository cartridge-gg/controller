import {
  CardContent,
  CreditIcon,
  InfoIcon,
  Select,
  SelectContent,
  SelectItem,
  Thumbnail,
  TokenSelectHeader,
} from "@cartridge/ui";
import { CostDetails } from "../types";
import { ExternalWalletType } from "@cartridge/controller";
import { FeesTooltip } from "./tooltip";
import { OnchainFeesTooltip } from "./onchain-tooltip";
import type { OnchainQuote } from "@/context";
import { useCallback, useMemo, useEffect } from "react";
import { usePurchaseContext } from "@/context";
import { num } from "starknet";

type PaymentRails = "stripe" | "crypto";
type PaymentUnit = "usdc" | "credits";

export const convertCentsToDollars = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

/**
 * Fiat/Stripe Cost Breakdown - displays total with fees tooltip
 */
export function CostBreakdown({
  rails,
  costDetails,
  walletType,
  paymentUnit,
  openFeesTooltip = false,
}: {
  rails: PaymentRails;
  costDetails?: CostDetails;
  walletType?: ExternalWalletType;
  paymentUnit?: PaymentUnit;
  openFeesTooltip?: boolean;
}) {
  if (rails === "crypto" && !walletType) {
    return null;
  }

  if (!costDetails) {
    return null;
  }

  return (
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
  );
}

/**
 * Onchain Cost Breakdown - for token-based payments directly to smart contracts
 */
export function OnchainCostBreakdown({
  quote,
  openFeesTooltip = false,
  showTokenSelector = false,
}: {
  quote: OnchainQuote;
  openFeesTooltip?: boolean;
  showTokenSelector?: boolean;
}) {
  const {
    availableTokens,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    isFetchingConversion,
  } = usePurchaseContext();

  // Get token icon from available tokens
  const paymentTokenIcon = availableTokens.find(
    (token) => token.address.toLowerCase() === quote.paymentToken.toLowerCase(),
  )?.icon;
  const { symbol, decimals } = quote.paymentTokenMetadata;

  // Get default token (USDC if available) for fallback
  const defaultToken = useMemo(() => {
    if (availableTokens.length === 0) return undefined;
    const usdc = availableTokens.find((t) => t.symbol === "USDC");
    return usdc || availableTokens[0];
  }, [availableTokens]);

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

  // Format payment token amount with proper decimals
  const paymentAmount = Number(quote.totalCost) / Math.pow(10, decimals);

  // Format converted equivalent if available
  const convertedEquivalent = convertedPrice
    ? Number(convertedPrice.amount) /
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
          <div className="flex items-center gap-1.5">
            {showTokenSelector ? (
              <>
                {!isPaymentTokenSameAsSelected &&
                  convertedEquivalent !== null &&
                  displayToken &&
                  !isFetchingConversion && (
                    <span className="text-foreground-400">
                      ${formatAmount(convertedEquivalent)}
                    </span>
                  )}
                <span className="text-foreground-100">
                  {formatAmount(
                    !isPaymentTokenSameAsSelected &&
                      convertedEquivalent !== null
                      ? convertedEquivalent
                      : paymentAmount,
                  )}{" "}
                  {!isPaymentTokenSameAsSelected && convertedEquivalent !== null
                    ? convertedPrice?.tokenMetadata.symbol
                    : symbol}
                </span>
                <div className="flex items-center gap-1">
                  {((!isPaymentTokenSameAsSelected &&
                    convertedPrice?.tokenMetadata.symbol &&
                    availableTokens.find(
                      (t) => t.symbol === convertedPrice?.tokenMetadata.symbol,
                    )?.icon) ||
                    paymentTokenIcon) && (
                    <Thumbnail
                      icon={
                        (!isPaymentTokenSameAsSelected &&
                          convertedPrice?.tokenMetadata.symbol &&
                          availableTokens.find(
                            (t) =>
                              t.symbol === convertedPrice?.tokenMetadata.symbol,
                          )?.icon) ||
                        paymentTokenIcon
                      }
                      rounded
                      size="xs"
                      variant="light"
                    />
                  )}
                  <span className="text-xs text-foreground-400">
                    {!isPaymentTokenSameAsSelected &&
                    convertedEquivalent !== null
                      ? convertedPrice?.tokenMetadata.symbol
                      : symbol}
                  </span>
                </div>
              </>
            ) : (
              <>
                {convertedEquivalent !== null && !isFetchingConversion && (
                  <span className="text-foreground-400">
                    ${formatAmount(convertedEquivalent)}
                  </span>
                )}
                <span className="text-foreground-100">
                  {formatAmount(paymentAmount)} {symbol}
                </span>
                <div className="flex items-center gap-1">
                  {paymentTokenIcon && (
                    <Thumbnail
                      icon={paymentTokenIcon}
                      rounded
                      size="xs"
                      variant="light"
                    />
                  )}
                  <span className="text-xs text-foreground-400">{symbol}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      {showTokenSelector && availableTokens.length > 0 && (
        <Select
          value={displayToken?.address}
          onValueChange={handleTokenChange}
          defaultValue={defaultToken?.address}
          disabled={availableTokens.length <= 1}
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
      )}
    </div>
  );
}

const PaymentType = ({ unit }: { unit?: PaymentUnit }) => {
  if (!unit) {
    return null;
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
