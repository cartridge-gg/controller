import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useChainId } from "@/hooks/connection";
import { ErrorAlertIcon, EthereumIcon, Spinner } from "@cartridge/ui-next";

export function Fees({
  maxFee,
  variant,
}: {
  maxFee?: bigint;
  variant?: Variant;
}) {
  const chainId = useChainId();
  const [formattedFee, setFormattedFee] = useState<string>();

  useEffect(() => {
    if (maxFee === undefined) {
      return;
    }

    setFormattedFee(
      maxFee === 0n
        ? "FREE"
        : maxFee > 10000000000000n
          ? `~${parseFloat(formatUnits(maxFee, 18)).toFixed(5)}`
          : "<0.00001",
    );
  }, [chainId, maxFee]);

  return (
    <div className="w-full overflow-hidden rounded">
      {formattedFee ? (
        <LineItem
          name="Network Fee"
          value={formattedFee}
          isLoading={!formattedFee}
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
    <div className="flex items-center w-full h-10 p-4 bg-secondary text-muted-foreground">
      <p className="text-xs uppercase font-bold">{name}</p>
      <div className="flex-1" />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex items-center gap-0">
          {variant && <ErrorAlertIcon variant={variant} />}
          {value !== "FREE" && <EthereumIcon className="text-foreground" />}
          <p className="text-sm">{value}</p>
        </div>
      )}
    </div>
  );
}

type Variant = "info" | "warning" | "error";
