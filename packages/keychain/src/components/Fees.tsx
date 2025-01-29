import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useChainId } from "@/hooks/connection";
import { ErrorAlertIcon, Spinner, StarknetIcon } from "@cartridge/ui-next";
import { EstimateFee } from "starknet";
import { usePrice } from "@/hooks/price";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { ErrorAlert } from "./ErrorAlert";

export function Fees({
  isLoading: isEstimating,
  maxFee,
  variant,
}: {
  isLoading: boolean;
  maxFee?: EstimateFee;
  variant?: Variant;
}) {
  const chainId = useChainId();
  const {
    isLoading: isPriceLoading,
    price,
    error,
  } = usePrice(TokenPair.StrkUsdc);
  const [formattedFee, setFormattedFee] = useState<string>();
  const isLoading = isEstimating || isPriceLoading;

  useEffect(() => {
    if (isLoading || error) {
      return;
    }

    if (maxFee && maxFee.overall_fee) {
      // Convert overall_fee from FRI to STRK
      const feeInStrk = parseFloat(formatUnits(maxFee.overall_fee, 18));

      // Convert price amount to dollars using decimals
      const priceInUsd = parseFloat(price.amount) / 10 ** price.decimals;

      // Calculate fee value in USD
      const feeInUsd = feeInStrk * priceInUsd;

      // Round to 2 decimal places
      const rounded = parseFloat(feeInUsd.toFixed(2));
      const formatted = feeInUsd === rounded ? `$${rounded}` : `~$${rounded}`;
      setFormattedFee(formatted);
    } else {
      setFormattedFee("FREE");
    }
  }, [chainId, maxFee]);

  if (error) {
    <ErrorAlert
      title="Error fetching fee token price"
      description="error"
      variant="error"
    />;
  }

  return (
    <div className="w-full overflow-hidden rounded">
      {formattedFee ? (
        <LineItem
          name="Network Fee"
          value={formattedFee}
          isLoading={isLoading}
          variant={variant}
        />
      ) : (
        <LineItem name="Calculating Fees" isLoading />
      )}
    </div>
  );
}

function LineItem({
  name,
  value,
  isLoading = false,
  variant,
}: {
  name: string;
  description?: string;
  value?: string;
  isLoading?: boolean;
  variant?: Variant;
}) {
  return (
    <div className="flex items-center w-full h-10 p-4 bg-background-100 text-muted-foreground">
      <p className="text-xs">{name}</p>
      <div className="flex-1" />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex items-center justify-center gap-0">
          {variant && <ErrorAlertIcon variant={variant} />}
          <p className="text-sm text-foreground">{value}</p>
          {value !== "FREE" && (
            <div className="flex pl-1">
              <StarknetIcon size="sm" className="text-foreground" />
              <p className="text-sm text-foreground">STRK</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Variant = "info" | "warning" | "error";
