import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { useConnection } from "../connection";
import { request } from "@/utils/graphql";
import {
  CoinflowDestinationFieldsFragment,
  CoinflowPayoutSpeed,
  CoinflowWithdrawalDocument,
  CoinflowWithdrawalFieldsFragment,
  CoinflowWithdrawalQuery,
  CoinflowWithdrawalStatus,
  CreateCoinflowBankAccountInput,
  CreateCoinflowKycInput,
  CreateCoinflowWithdrawalInput,
  DeleteCoinflowDestinationInput,
  useCoinflowWithdrawalQuery,
  useCoinflowWithdrawQuoteQuery,
  useCoinflowWithdrawStatusQuery,
  useCreateCoinflowBankAccountMutation,
  useCreateCoinflowKycMutation,
  useCreateCoinflowWithdrawalMutation,
  useDeleteCoinflowDestinationMutation,
} from "@/utils/api";
import { useCoinflowIsMainnet } from "./coinflow";

// Re-export generated enums/types so the withdraw components import from one
// place instead of reaching into the generated module (mirrors coinflow.ts).
export {
  CoinflowBankAccountType,
  CoinflowKycStatus,
  CoinflowPayoutSpeed,
  CoinflowWithdrawalFailureCode,
  CoinflowWithdrawalStatus,
} from "@/utils/api";
export type {
  CoinflowDestinationFieldsFragment as CoinflowDestination,
  CoinflowWithdrawalFieldsFragment as CoinflowWithdrawal,
} from "@/utils/api";
export { useCoinflowIsMainnet } from "./coinflow";

// react-query key prefix for the status query; invalidating this after any
// mutation that mutates KYC/destinations re-fetches the live Coinflow state.
const WITHDRAW_STATUS_KEY = "CoinflowWithdrawStatus";

// ---------------------------------------------------------------------------
// Status query
// ---------------------------------------------------------------------------

/**
 * Live withdrawal status for the current user: KYC state, linked destinations,
 * and the withdrawable bounds. The hosted-KYC window round-trips out of the
 * app, so this refetches on window focus to pick up a freshly-approved KYC.
 * `isMainnet` is threaded from `useCoinflowIsMainnet()`; the backend treats
 * absent/false as sandbox.
 */
export const useCoinflowWithdrawStatus = (options?: { enabled?: boolean }) => {
  const { controller } = useConnection();
  const { isCoinflowMainnet } = useCoinflowIsMainnet();

  const result = useCoinflowWithdrawStatusQuery(
    { isMainnet: isCoinflowMainnet },
    {
      enabled: (options?.enabled ?? true) && !!controller,
      refetchOnWindowFocus: true,
      retry: false,
    },
  );

  return {
    ...result,
    data: result.data?.coinflowWithdrawStatus,
  };
};

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

/**
 * Registers (or refreshes) payout KYC. The address fields are optional —
 * name/DOB/email are attached server-side from the identity we already hold. A
 * result carrying `verificationLink` is a *success* meaning "complete hosted
 * verification", not an error. Invalidates the status query on success so the
 * refreshed `kycStatus`/`verificationLink` land.
 */
export const useCreateCoinflowKYC = () => {
  const queryClient = useQueryClient();
  const { isCoinflowMainnet } = useCoinflowIsMainnet();
  const { mutateAsync, isLoading, error } = useCreateCoinflowKycMutation();

  const createKYC = useCallback(
    async (address?: Omit<CreateCoinflowKycInput, "isMainnet">) => {
      const result = await mutateAsync({
        input: { ...address, isMainnet: isCoinflowMainnet },
      });
      await queryClient.invalidateQueries([WITHDRAW_STATUS_KEY]);
      return result.createCoinflowKYC;
    },
    [mutateAsync, isCoinflowMainnet, queryClient],
  );

  return { createKYC, isLoading, error: error as Error | null };
};

// ---------------------------------------------------------------------------
// Destinations (link / unlink)
// ---------------------------------------------------------------------------

/**
 * Links a bank account for payouts (passthrough to Coinflow, which tokenizes +
 * stores it — we persist nothing). Returns the normalized `CoinflowDestination`
 * ready to select. A `FAILED_PRECONDITION` "address required" means the KYC
 * record has no address on file; the caller reveals the address fields and
 * resubmits. Invalidates the status query on success so the new destination
 * lists.
 */
export const useCreateCoinflowBankAccount = () => {
  const queryClient = useQueryClient();
  const { isCoinflowMainnet } = useCoinflowIsMainnet();
  const { mutateAsync, isLoading, error } =
    useCreateCoinflowBankAccountMutation();

  const createBankAccount = useCallback(
    async (
      input: Omit<CreateCoinflowBankAccountInput, "isMainnet">,
    ): Promise<CoinflowDestinationFieldsFragment> => {
      const result = await mutateAsync({
        input: { ...input, isMainnet: isCoinflowMainnet },
      });
      await queryClient.invalidateQueries([WITHDRAW_STATUS_KEY]);
      return result.createCoinflowBankAccount;
    },
    [mutateAsync, isCoinflowMainnet, queryClient],
  );

  return { createBankAccount, isLoading, error: error as Error | null };
};

/**
 * Unlinks a payout destination by `type` + `token`. Invalidates the status
 * query on success so the removed destination stops listing.
 */
export const useDeleteCoinflowDestination = () => {
  const queryClient = useQueryClient();
  const { isCoinflowMainnet } = useCoinflowIsMainnet();
  const { mutateAsync, isLoading, error } =
    useDeleteCoinflowDestinationMutation();

  const deleteDestination = useCallback(
    async (
      target: Omit<DeleteCoinflowDestinationInput, "isMainnet">,
    ): Promise<boolean> => {
      const result = await mutateAsync({
        input: { ...target, isMainnet: isCoinflowMainnet },
      });
      await queryClient.invalidateQueries([WITHDRAW_STATUS_KEY]);
      return result.deleteCoinflowDestination;
    },
    [mutateAsync, isCoinflowMainnet, queryClient],
  );

  return { deleteDestination, isLoading, error: error as Error | null };
};

// ---------------------------------------------------------------------------
// Quote
// ---------------------------------------------------------------------------

// The quote is display-only; the backend re-validates the authoritative fee at
// initiation. Treat it as stale after this window so a lingering drawer doesn't
// confirm against an old fee.
const QUOTE_STALE_MS = 60_000;

/**
 * Quotes a withdrawal (fee / net / ETA / remaining limit) for an amount +
 * speed + destination. Disabled until all three are present. The merchant
 * balance pre-check runs here, so `UNAVAILABLE` "temporarily unavailable" can
 * surface at quote time.
 *
 * The request amount is `credits` — whole account credits, no decimals
 * (1 credit = $0.01, so numerically credits == cents). Everything in the
 * response is USD cents.
 */
export const useCoinflowWithdrawQuote = (
  credits: number | undefined,
  method: CoinflowPayoutSpeed,
  token: string | undefined,
  options?: { enabled?: boolean },
) => {
  const { isCoinflowMainnet } = useCoinflowIsMainnet();

  const isReady =
    (options?.enabled ?? true) &&
    !!credits &&
    credits > 0 &&
    !!token &&
    !!method;

  const result = useCoinflowWithdrawQuoteQuery(
    {
      input: {
        credits: credits ?? 0,
        method,
        token: token ?? "",
        isMainnet: isCoinflowMainnet,
      },
    },
    {
      enabled: isReady,
      retry: false,
      staleTime: QUOTE_STALE_MS,
    },
  );

  return {
    ...result,
    data: result.data?.coinflowWithdrawQuote,
  };
};

// ---------------------------------------------------------------------------
// Withdrawal submit
// ---------------------------------------------------------------------------

/**
 * Initiates a withdrawal. The gross amount is `credits` (whole account
 * credits; 1 credit = $0.01 — numerically credits == cents); the returned
 * `CoinflowWithdrawal` amounts are USD cents. Credits are debited server-side
 * in the same transaction, so the withdrawal already exists in credits
 * history. Poll it with `waitForCoinflowWithdrawal`.
 */
export const useCreateCoinflowWithdrawal = () => {
  const { isCoinflowMainnet } = useCoinflowIsMainnet();
  const { mutateAsync, isLoading, error } =
    useCreateCoinflowWithdrawalMutation();

  const createWithdrawal = useCallback(
    async (
      input: Omit<CreateCoinflowWithdrawalInput, "isMainnet">,
    ): Promise<CoinflowWithdrawalFieldsFragment> => {
      const result = await mutateAsync({
        input: { ...input, isMainnet: isCoinflowMainnet },
      });
      return result.createCoinflowWithdrawal;
    },
    [mutateAsync, isCoinflowMainnet],
  );

  return { createWithdrawal, isLoading, error: error as Error | null };
};

// ---------------------------------------------------------------------------
// Status poller
// ---------------------------------------------------------------------------

const WITHDRAWAL_POLL_INTERVAL_MS = 2_000;

/**
 * Poll a withdrawal until it leaves the initial `PENDING` state — i.e. reaches
 * `PROCESSING` (accepted; ACH settles over days, not while the drawer is open)
 * or synchronously `FAILED`. `COMPLETED` is treated as terminal too. A
 * long-lived `PENDING` is the ambiguous-outcome case (§8.6): the reconciler
 * resolves it, so on timeout we return the latest row rather than throwing —
 * the caller shows "processing; check back shortly". Final completed/failed is
 * a credits-history concern, not the drawer's.
 *
 * Mirrors `waitForCoinflowSettlement` in coinflow.ts.
 */
export async function waitForCoinflowWithdrawal(
  id: string,
  timeoutMs = 60_000,
): Promise<CoinflowWithdrawalFieldsFragment> {
  const startedAt = Date.now();
  let latest: CoinflowWithdrawalFieldsFragment | undefined;

  while (Date.now() - startedAt < timeoutMs) {
    const result = await request<CoinflowWithdrawalQuery>(
      CoinflowWithdrawalDocument,
      { id },
    );
    latest = result.coinflowWithdrawal;

    switch (latest.status) {
      case CoinflowWithdrawalStatus.Processing:
      case CoinflowWithdrawalStatus.Completed:
      case CoinflowWithdrawalStatus.Failed:
        return latest;
      case CoinflowWithdrawalStatus.Pending:
      default:
        await new Promise((resolve) =>
          setTimeout(resolve, WITHDRAWAL_POLL_INTERVAL_MS),
        );
    }
  }

  if (!latest) {
    throw new Error("Could not load the withdrawal status.");
  }

  // Ambiguous outcome: still PENDING after the timeout. Not an error — the
  // reconciler will resolve it and the row is already in credits history.
  return latest;
}

// ---------------------------------------------------------------------------
// Single-withdrawal query (status drawer)
// ---------------------------------------------------------------------------

/**
 * Reads a single withdrawal by id — used by the status drawer to render the
 * current state (incl. `failureCode`/`failureReason` on failure). Disabled
 * until an id is present.
 */
export const useCoinflowWithdrawal = (
  id: string | undefined,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) => {
  const result = useCoinflowWithdrawalQuery(
    { id: id ?? "" },
    {
      enabled: (options?.enabled ?? true) && !!id,
      retry: false,
      refetchInterval: options?.refetchInterval,
    },
  );

  return {
    ...result,
    data: result.data?.coinflowWithdrawal,
  };
};
