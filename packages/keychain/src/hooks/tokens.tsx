import { useContext, useEffect, useState } from "react";
import {
  TokensContext,
  TokensContextValue,
} from "@/components/provider/tokens";
import { Call, getChecksumAddress, RpcProvider } from "starknet";

export function useTokens(): TokensContextValue {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokensProvider");
  }

  return context;
}

export function useToken(address: string) {
  const { tokens, isLoading, error } = useTokens();
  const token = tokens[getChecksumAddress(address)];
  return {
    token,
    isLoading,
    error,
  };
}

export function useFeeToken() {
  const { feeToken, isLoading, error } = useTokens();
  return {
    token: feeToken,
    isLoading,
    error,
  };
}

export function formatBalance(
  amount: bigint,
  decimals = 18,
  significantDigits?: number,
) {
  // Convert bigint to decimal string with proper decimal places
  const stringValue = amount.toString();
  const wholePart = stringValue.slice(0, -decimals) || "0";
  const fractionalPart = stringValue.slice(-decimals).padStart(decimals, "0");

  // Parse the number and handle special cases
  const num = parseFloat(`${wholePart}.${fractionalPart}`);

  // If the number is very small (less than 0.01), find first significant digit
  if (wholePart === "0" && num > 0) {
    // Find first non-zero digit
    for (let i = 0; i < fractionalPart.length; i++) {
      if (fractionalPart[i] !== "0") {
        // Return number with either specified significant digits or all digits until last non-zero
        if (significantDigits !== undefined) {
          return num.toFixed(i + significantDigits);
        } else {
          // Find last non-zero digit
          for (let j = fractionalPart.length - 1; j >= i; j--) {
            if (fractionalPart[j] !== "0") {
              return num.toFixed(j + 1);
            }
          }
        }
      }
    }
  }

  // For regular numbers, format with thousands separators and up to 2 decimal places.
  // Do not force trailing ".00" for whole numbers — keep whole numbers without decimals,
  // but keep up to two decimals when needed (e.g. 1.5 -> "1.5", 1.23 -> "1.23").
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function convertTokenAmountToUSD(
  amount: bigint,
  decimals: number,
  price: { amount: string; decimals: number },
) {
  // Convert price to BigInt
  const priceAmount = BigInt(price.amount);

  // Calculate USD value entirely in BigInt
  // Formula: (amount * priceAmount) / (10 ** decimals)
  const valueInBaseUnits = (amount * priceAmount) / BigInt(10 ** decimals);

  // Convert to decimal for display, handling the price decimals
  const valueInUsd = Number(valueInBaseUnits) / 10 ** price.decimals;

  // Handle zero amount
  if (valueInUsd === 0) {
    return "$0";
  }

  // For small numbers (< 0.01), show 3 decimal places
  if (valueInUsd < 0.01) {
    const formatted = valueInUsd.toFixed(3);
    // If it rounds to 0.000 but is actually non-zero, show <$0.001
    if (formatted === "0.000" && valueInUsd > 0) {
      return "<$0.001";
    }
    return `$${formatted}`;
  }

  // For numbers between 0.01 and 0.1, show 3 decimal places
  if (valueInUsd < 0.1) {
    return `$${valueInUsd.toFixed(3)}`;
  }

  // Format with thousands separators
  const isWhole = valueInUsd % 1 === 0;

  if (isWhole) {
    // For whole numbers, format without decimal places
    const formatted = Math.floor(valueInUsd).toLocaleString("en-US");
    return `$${formatted}`;
  } else {
    // For non-whole numbers, format with exactly 2 decimal places
    const formatted = valueInUsd.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `$${formatted}`;
  }
}

export function convertUSDToTokenAmount(
  usdAmount: number,
  decimals: number,
  price: { amount: string; decimals: number },
): bigint {
  // Convert price to BigInt
  const priceAmount = BigInt(price.amount);

  // Convert USD amount to base units (considering price decimals)
  const usdInBaseUnits = BigInt(
    // Use string to maintain precision
    (usdAmount * 10 ** price.decimals).toLocaleString("fullwide", {
      useGrouping: false,
      maximumFractionDigits: 0,
    }),
  );

  // Calculate token amount using BigInt arithmetic
  // Formula: (usdInBaseUnits * (10 ** decimals)) / priceAmount
  const tokenAmount = (usdInBaseUnits * BigInt(10 ** decimals)) / priceAmount;

  return tokenAmount;
}

export const CREDITS_PER_USD = 100;

export function creditsToUSD(credits: number) {
  return credits / CREDITS_PER_USD;
}

export function usdToCredits(usd: number) {
  return usd * CREDITS_PER_USD;
}

/**
 * Hook to fetch token decimals from a contract
 * @param contractAddress - The address of the token contract
 * @param rpcUrl - The RPC URL to use for the provider
 * @returns Object with decimals, isLoading, and error states
 */
export function useTokenDecimals(
  contractAddress: string | undefined,
  rpcUrl: string,
) {
  const [decimals, setDecimals] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!contractAddress || !rpcUrl) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    const fetchDecimals = async () => {
      try {
        const provider = new RpcProvider({ nodeUrl: rpcUrl });
        const checksumAddress = getChecksumAddress(contractAddress);

        const result = await provider.callContract({
          contractAddress: checksumAddress,
          entrypoint: "decimals",
          calldata: [],
        } as Call);

        if (!cancelled) {
          setDecimals(Number(result[0]));
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch decimals"),
          );
          setIsLoading(false);
        }
      }
    };

    fetchDecimals();

    return () => {
      cancelled = true;
    };
  }, [contractAddress, rpcUrl]);

  return { decimals, isLoading, error };
}
