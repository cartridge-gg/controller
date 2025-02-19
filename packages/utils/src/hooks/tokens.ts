import { useContext } from "react";
import { TokensContext, TokensContextValue } from "../context/tokens";
import { getChecksumAddress } from "starknet";

export function useTokens(): TokensContextValue {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error("useERC20 must be used within a ERC20Provider");
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
