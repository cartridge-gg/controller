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
    token: feeToken!,
    isLoading,
    error,
  };
}

export function formatBalance(amount: bigint, decimals = 18) {
  // Convert bigint to decimal string with proper decimal places
  const stringValue = amount.toString();
  const wholePart = stringValue.slice(0, -decimals) || "0";
  const fractionalPart = stringValue.slice(-decimals).padStart(decimals, "0");

  // Parse the number and handle special cases
  const num = parseFloat(`${wholePart}.${fractionalPart}`);

  // If whole part is 0 and decimals are all 0, find first non-zero decimal
  if (wholePart === "0" && num === 0) {
    for (let i = 0; i < fractionalPart.length; i++) {
      if (fractionalPart[i] !== "0") {
        return num.toFixed(i + 1);
      }
    }
    return "0";
  }

  // For other numbers, only keep decimals if they're not 0
  const fixed2 = num.toFixed(2);
  if (fixed2.endsWith(".00")) return fixed2.slice(0, -3);
  if (fixed2.endsWith("0")) return fixed2.slice(0, -1);
  return fixed2;
}

export function formatUSDBalance(
  amount: bigint,
  decimals: number,
  price: { amount: string; decimals: number },
) {
  // Convert amount to decimal value
  const value = parseFloat(formatBalance(amount, decimals));

  // Convert price amount to dollars using decimals
  const priceInUsd = parseFloat(price.amount) / 10 ** price.decimals;

  // Calculate USD value
  const valueInUsd = value * priceInUsd;

  // Round to 2 decimal places
  const rounded = parseFloat(valueInUsd.toFixed(2));

  // Add ~ prefix if rounded value differs from actual value
  return valueInUsd === rounded ? `$${rounded}` : `~$${rounded}`;
}
