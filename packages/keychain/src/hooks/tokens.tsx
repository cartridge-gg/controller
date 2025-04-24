import { useContext } from "react";
import {
  TokensContext,
  TokensContextValue,
} from "@/components/provider/tokens";
import { getChecksumAddress } from "starknet";

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

  // For regular numbers, format with up to 2 decimal places
  const fixed2 = num.toFixed(2);
  if (fixed2.endsWith(".00")) {
    return fixed2.slice(0, -3);
  }

  if (fixed2.endsWith("0")) {
    return fixed2.slice(0, -1);
  }

  return fixed2;
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

  // Format with exactly 2 decimal places for non-whole numbers
  const formatted = valueInUsd.toFixed(2);
  const isWhole = formatted.endsWith(".00");

  // Return whole numbers without decimals, otherwise show exactly 2 decimal places
  return "$" + (isWhole ? Math.floor(valueInUsd).toString() : formatted);
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

export const CREDITS_PER_USD = 1000;

export function creditsToUSD(credits: number) {
  return credits / CREDITS_PER_USD;
}

export function usdToCredits(usd: number) {
  return usd * CREDITS_PER_USD;
}
