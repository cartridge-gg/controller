import { useEffect, useState } from "react";
import { FeeEstimate } from "starknet";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useFeeToken,
} from "@/hooks/tokens";
import { ErrorAlert } from "./ErrorAlert";
import { Total } from "./Total";

export function Fees({
  isLoading: isEstimating,
  maxFee,
}: {
  isLoading: boolean;
  maxFee?: FeeEstimate;
}) {
  const { isLoading: isPriceLoading, token, error } = useFeeToken();
  const [feeValue, setFeeValue] = useState<number>();
  const [usdFee, setUsdFee] = useState<string>();
  const isLoading = isEstimating || isPriceLoading;

  useEffect(() => {
    if (isLoading || error || !token) {
      return;
    }

    if (maxFee && (maxFee.overall_fee == "0x0" || maxFee.overall_fee == "0")) {
      setUsdFee("FREE");
      return;
    }

    if (maxFee && maxFee.overall_fee && token.price) {
      const fee = Number(
        formatBalance(BigInt(maxFee.overall_fee), token.decimals),
      );
      const usd = convertTokenAmountToUSD(
        BigInt(maxFee.overall_fee),
        18,
        token.price,
      );
      setFeeValue(fee);
      setUsdFee(usd);
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

  if (usdFee === "FREE") {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded pt-2">
      <Total
        label={isLoading ? "Calculating Fees" : "Network Fee"}
        token={token}
        totalValue={feeValue ?? 0}
        decimals={2}
        usdValue={usdFee}
        isLoading={isLoading}
      />
    </div>
  );
}
