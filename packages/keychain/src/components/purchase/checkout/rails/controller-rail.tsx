import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useControllerPurchase } from "@/hooks/payments/controller";
import { useUsdcToken } from "@/hooks/payments/usdc";
import type { TokenOption } from "@/context";

/**
 * Contract the controller (USDC deposit) checkout UI depends on.
 *
 * Unlike the Coinbase/Coinflow rails — which are dumb value-wrappers because the
 * same `useCoinbase()`/Coinflow intent is shared between the bundle flow and the
 * credits flow — the controller rail is credits-only with a single consumer.
 * So this provider owns the whole rail: it calls `useControllerPurchase()`
 * itself and derives the USDC token, rather than having the host wire them up.
 * The product only supplies the amount and the completion seam.
 */
export interface ControllerRailContextValue {
  /** USD amount being deposited (1 USDC = $1). */
  amount: number;
  /** The USDC token the deposit is paid in (used by the cost breakdown UI). */
  usdcToken: TokenOption;
  /** Controller's current USDC balance, or undefined while unknown. */
  balance: number | undefined;
  /** True when the controller can't cover `amount` in USDC. */
  hasInsufficientBalance: boolean;
  /** Runs the USDC deposit and resolves once the sweeper confirms the payment. */
  execute: () => Promise<void>;
  /** Post-settlement seam (host: refresh balance + close drawer). Shared name
   * with every other rail so the host has one uniform completion seam. */
  onComplete: () => void;
}

const ControllerRailContext = createContext<
  ControllerRailContextValue | undefined
>(undefined);

export function ControllerRailProvider({
  amount,
  onComplete,
  children,
}: {
  amount: number;
  onComplete: () => void;
  children: ReactNode;
}) {
  // Paying with the controller fronts USDC, so the deposit is denominated in the
  // chain's USDC.
  const usdcToken = useUsdcToken();

  const { usdcBalance, hasInsufficientBalance, handlePurchaseWithController } =
    useControllerPurchase({ usdcToken, amount });

  const value = useMemo<ControllerRailContextValue>(
    () => ({
      amount,
      usdcToken,
      balance: usdcBalance,
      hasInsufficientBalance,
      execute: handlePurchaseWithController,
      onComplete,
    }),
    [
      amount,
      usdcToken,
      usdcBalance,
      hasInsufficientBalance,
      handlePurchaseWithController,
      onComplete,
    ],
  );

  return (
    <ControllerRailContext.Provider value={value}>
      {children}
    </ControllerRailContext.Provider>
  );
}

export function useControllerRail(): ControllerRailContextValue {
  const ctx = useContext(ControllerRailContext);
  if (!ctx) {
    throw new Error(
      "useControllerRail must be used within a ControllerRailProvider",
    );
  }
  return ctx;
}
