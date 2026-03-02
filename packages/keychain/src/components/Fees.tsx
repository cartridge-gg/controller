import React, { useEffect, useMemo, useState } from "react";
import { FeeEstimate } from "starknet";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useFeeToken,
} from "@/hooks/tokens";
import { useTokens } from "@/hooks/token";
import { ErrorAlert } from "./ErrorAlert";
import { FeesRow } from "./FeesRow";
import { cn } from "@cartridge/ui/utils";

export type FeesData = {
  label: string;
  contractAddress: string;
  amount: number;
  decimals?: number;
  usdValue?: number | string;
  tooltipContents?: React.ReactNode;
};

export function Fees({
  isLoading: isEstimating,
  maxFee,
  ctrlError,
  additionalFees,
}: {
  isLoading: boolean;
  maxFee?: FeeEstimate;
  ctrlError?: React.ReactElement;
  additionalFees?: FeesData[];
}) {
  const { isLoading: isPriceLoading, token: feeToken, error } = useFeeToken();
  const [feeValue, setFeeValue] = useState<number>();
  const [usdFee, setUsdFee] = useState<string>();
  const isLoading = isEstimating || isPriceLoading;

  const { tokens, status: tokensStatus } = useTokens();

  useEffect(() => {
    if (isLoading || error || !feeToken) {
      return;
    }

    if (maxFee && (maxFee.overall_fee == "0x0" || maxFee.overall_fee == "0")) {
      setUsdFee("FREE");
      return;
    }

    if (maxFee && maxFee.overall_fee && feeToken.price) {
      const fee = Number(
        formatBalance(BigInt(maxFee.overall_fee), feeToken.decimals),
      );
      const usd = convertTokenAmountToUSD(
        BigInt(maxFee.overall_fee),
        18,
        feeToken.price,
      );
      setFeeValue(fee);
      setUsdFee(usd);
    }
  }, [maxFee, feeToken, error, isLoading]);

  const displayFees = useMemo(
    () => isLoading || Boolean(!error && usdFee && usdFee !== "FREE"),
    [error, usdFee, isLoading],
  );

  return (
    <>
      {error && (
        <ErrorAlert
          title="Fee estimation error"
          description="Unable to retrieve fee token price"
          variant="error"
        />
      )}
      {ctrlError}
      {(displayFees || additionalFees?.length !== 0) && (
        <div
          className={cn(
            "w-full rounded pt-2",
            "flex flex-col gap-2 p-2.5 items-center justify-between bg-background-125 border border-background-200 rounded",
          )}
        >
          {additionalFees?.map((feesData, index) => (
            <FeesRow
              key={index}
              label={feesData.label}
              amount={feesData.amount}
              decimals={feesData.decimals}
              usdValue={feesData.usdValue}
              tooltipContents={feesData.tooltipContents}
              token={tokens.find(
                (token) =>
                  BigInt(token.metadata.address) ===
                  BigInt(feesData.contractAddress),
              )}
              isLoading={tokensStatus == "loading"}
            />
          ))}
          {displayFees && (
            <FeesRow
              label={isLoading ? "Calculating Fees" : "Network Fee"}
              amount={feeValue ?? 0}
              decimals={2}
              usdValue={usdFee}
              token={
                feeToken
                  ? {
                      balance: {
                        amount: Number(feeToken?.balance ?? 0),
                        value: 0,
                        change: 0,
                      },
                      metadata: {
                        name: feeToken.name,
                        address: feeToken.address,
                        decimals: feeToken.decimals,
                        symbol: feeToken.symbol,
                        image: feeToken.icon,
                      },
                    }
                  : undefined
              }
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </>
  );
}
