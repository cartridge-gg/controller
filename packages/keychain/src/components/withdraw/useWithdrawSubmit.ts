import { useCallback, useRef, useState } from "react";
import { useToast } from "@/context/toast";
import {
  useCreateCoinflowWithdrawal,
  type CoinflowWithdrawal,
} from "@/hooks/payments/coinflow-withdraw";
import type { WithdrawQuoteSelection } from "./useWithdrawQuote";

export type WithdrawSubmit = {
  /**
   * Initiates the withdrawal for the picked amount + selection. No-op until
   * both are present (the method drawer's button is gated on a resolved quote,
   * so both always are by the time it can fire).
   */
  submit: () => void;
  /** A withdrawal request is in flight — drives the button's loading state. */
  isLoading: boolean;
  /** The initiation failed — surfaced as an error component on the method drawer. */
  error: Error | null;
  /** Clears a prior error (e.g. when the method drawer re-opens). */
  reset: () => void;
};

/**
 * Owns the final payout (§3.6): initiates the withdrawal for the confirmed
 * (amount, destination, speed) and reports its return status. The provider
 * holds this in context; the method drawer's WITHDRAW button calls `submit`
 * and reads `isLoading`/`error`. On success it emits the "Withdrawal Initiated"
 * toast and hands back to `onSuccess`, where the provider returns to the
 * overview drawer — now listing the freshly-created withdrawal in History.
 *
 * The gross amount is `credits` (whole account credits); the display quote's
 * fee is never trusted here — the backend re-validates the authoritative fee at
 * initiation.
 */
export const useWithdrawSubmit = ({
  credits,
  selection,
  onSuccess,
}: {
  credits: number | undefined;
  selection: WithdrawQuoteSelection | undefined;
  onSuccess: (withdrawal: CoinflowWithdrawal) => void;
}): WithdrawSubmit => {
  const { toast } = useToast();
  const { createWithdrawal } = useCreateCoinflowWithdrawal();
  const [error, setError] = useState<Error | null>(null);
  // Local, spanning the whole operation (mutation + the status refetch inside
  // createWithdrawal, up to `onSuccess`) — the mutation's own `isLoading` drops
  // before the refetch resolves, which would briefly re-enable the button and
  // let a second click initiate a duplicate withdrawal. The ref hard-guards
  // that race; the state drives the button.
  const [isLoading, setIsLoading] = useState(false);
  const inFlight = useRef(false);

  const submit = useCallback(() => {
    if (!credits || !selection || inFlight.current) return;
    inFlight.current = true;
    setError(null);
    setIsLoading(true);
    createWithdrawal({
      credits,
      method: selection.speed,
      token: selection.token,
    })
      .then((withdrawal) => {
        toast.success("Withdrawal Initiated");
        onSuccess(withdrawal);
      })
      .catch((e) => setError(e as Error))
      .finally(() => {
        inFlight.current = false;
        setIsLoading(false);
      });
  }, [credits, selection, createWithdrawal, toast, onSuccess]);

  const reset = useCallback(() => setError(null), []);

  return { submit, isLoading, error, reset };
};
