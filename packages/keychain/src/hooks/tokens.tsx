import { useContext } from "react";
import {
  TokensContext,
  TokensContextValue,
} from "@/components/provider/tokens";

export function useTokens(): TokensContextValue {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokensProvider");
  }

  return context;
}

export function useToken(address: string) {
  const { tokens, isLoading, error } = useTokens();

  return {
    token: tokens[address],
    isLoading,
    error,
  };
}
