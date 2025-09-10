import { useEffect, useState } from "react";
import { Spinner } from "@cartridge/ui";
import { FeeEstimate } from "starknet";

import { convertTokenAmountToUSD, useFeeToken } from "@/hooks/tokens";
import { ErrorAlert } from "./ErrorAlert";
import { ERC20 } from "./provider/tokens";

export function Fees({
  isLoading: isEstimating,
  maxFee,
}: {
  isLoading: boolean;
  maxFee?: FeeEstimate;
}) {
  const { isLoading: isPriceLoading, token, error } = useFeeToken();
  const [formattedFee, setFormattedFee] = useState<string>();
  const isLoading = isEstimating || isPriceLoading;

  useEffect(() => {
    console.log(maxFee, token)
    if (isLoading || error || !token) {
      return;
    }

    if (maxFee && (maxFee.overall_fee == "0x0" || maxFee.overall_fee == "0")){
      setFormattedFee("FREE");
      return
    }

    if (maxFee && maxFee.overall_fee && token.price) {
      const formatted = convertTokenAmountToUSD(
        BigInt(maxFee.overall_fee),
        18,
        token.price,
      );
      setFormattedFee(formatted);
    }
  }, [maxFee, token, error, isLoading]);

  if (error) {
    return (
      <ErrorAlert
        title="Fee estimation error"
        description="Unable to retrieve fee token price"
        variant="error"
      />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded">
      {formattedFee ? formattedFee == "FREE" ? undefined : (
        <LineItem
          name="Network Fee"
          amount={formattedFee}
          token={token}
          isLoading={isLoading}
        />
      ) : (
        <LineItem name="Calculating Fees" isLoading />
      )}
    </div>
  );
}

function LineItem({
  name,
  token,
  amount,
  isLoading = false,
}: {
  name: string;
  token?: ERC20;
  amount?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-center w-full h-10 p-4 bg-background-200 text-foreground-400">
      <p className="text-xs">{name}</p>
      <div className="flex-1" />

      {isLoading || !token ? (
        <Spinner />
      ) : (
        <div className="flex items-center justify-center gap-0">
          <p className="text-sm text-foreground">{amount}</p>
          {amount !== "FREE" && (
            <p className="text-sm text-foreground pl-1">{token.symbol}</p>
          )}
        </div>
      )}
    </div>
  );
}
