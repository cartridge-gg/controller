import { useCallback, useState } from "react";
import {
  CoinflowPayoutSpeed,
  useCoinflowWithdrawQuote,
  type CoinflowWithdrawQuote,
} from "@/hooks/payments/coinflow-withdraw";

/**
 * A chosen transfer method on the method drawer: a destination token paired
 * with one of that destination's supported delivery speeds. The method drawer
 * renders one card per (destination, speed) pair, so a click identifies both.
 */
export type WithdrawQuoteSelection = {
  token: string;
  speed: CoinflowPayoutSpeed;
};

export type WithdrawQuote = {
  /** The (destination, speed) the quote prices; undefined until a card is picked. */
  selection?: WithdrawQuoteSelection;
  /** Picks a (destination, speed) and (re)quotes it on the backend. */
  select: (selection: WithdrawQuoteSelection) => void;
  /** Clears the selection + quote (drawer close / flow reset). */
  reset: () => void;
  /** The priced quote (fee / net / ETA) for `selection`; undefined until it resolves. */
  data?: CoinflowWithdrawQuote;
  /** A quote request is in flight for the current selection. */
  isLoading: boolean;
  error: Error | null;
};

/**
 * Owns the transfer-method quote for the withdraw flow: which (destination,
 * speed) the user picked on the method drawer and the fee / net / ETA Coinflow
 * prices it at for the chosen `credits`. The provider holds this in context;
 * the method drawer reads `data`/`isLoading`/`error` and calls `select()` as
 * cards are clicked, gating its WITHDRAW button on a resolved quote. The quote
 * is display-only — the authoritative fee is re-validated at initiation.
 */
export const useWithdrawQuote = (
  credits: number | undefined,
): WithdrawQuote => {
  const [selection, setSelection] = useState<
    WithdrawQuoteSelection | undefined
  >();

  const result = useCoinflowWithdrawQuote(
    credits,
    selection?.speed,
    selection?.token,
    { enabled: !!selection },
  );

  const select = useCallback((next: WithdrawQuoteSelection) => {
    setSelection(next);
  }, []);

  const reset = useCallback(() => {
    setSelection(undefined);
  }, []);

  return {
    selection,
    select,
    reset,
    data: result.data,
    // react-query reports `isLoading` on an idle disabled query too; scope it
    // to an actual in-flight request so no card shows a spurious spinner
    // before a selection exists.
    isLoading: !!selection && result.isLoading,
    error: (result.error as Error | null) ?? null,
  };
};
