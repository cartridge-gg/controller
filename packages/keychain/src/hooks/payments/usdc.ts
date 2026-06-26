import { useMemo } from "react";
import { useConnection } from "@/hooks/connection";
import { USDC_ADDRESSES, USDC_ICON } from "@/utils/ekubo";
import type { TokenOption } from "@/context";

/**
 * The chain's USDC as a TokenOption. Credits purchases settle to USDC on-chain
 * (the controller fronts it, the onramp delivers it), so every credits rail
 * denominates its cost breakdown in USDC.
 */
export function useUsdcToken(): TokenOption {
  const { controller } = useConnection();
  return useMemo<TokenOption>(
    () => ({
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: controller
        ? (USDC_ADDRESSES[controller.chainId()] ?? "usdc")
        : "usdc",
      icon: USDC_ICON,
      contract: {} as TokenOption["contract"],
    }),
    [controller],
  );
}
