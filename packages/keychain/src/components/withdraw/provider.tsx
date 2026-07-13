import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  CoinflowKycStatus,
  useCoinflowWithdrawStatus,
} from "@/hooks/payments/coinflow-withdraw";
import type { CoinflowWithdrawStatusQuery } from "@/utils/api";
import { useConnection } from "@/hooks/connection";
import { useFeature } from "@/hooks/features";
import { useGeoLocation } from "@/hooks/geo";
import { WithdrawCredits } from "./WithdrawCredits";

export type CoinflowWithdrawStatus =
  CoinflowWithdrawStatusQuery["coinflowWithdrawStatus"];

/**
 * Flow steps. "overview" (the Withdraw Funds summary drawer) shows first on
 * every open; past it the step is derived from live data (mirrors
 * DepositCredits' derived step) — never a manually-advanced counter. A
 * returning, fully-onboarded user lands on "amount" automatically; a mid-flow
 * KYC failure demotes the step back to "onboarding-kyc". "confirm"/"status"
 * progressions land with their drawers.
 */
export type WithdrawStep =
  | "overview"
  | "onboarding-kyc"
  | "onboarding-bank"
  | "amount"
  | "confirm"
  | "status";

export type WithdrawContextValue = {
  isOpen: boolean;
  /** Opens the withdraw flow (from NavigationHeader onWithdraw). */
  initiateWithdraw: () => void;
  closeWithdraw: () => void;
  /**
   * Entry-point gating (§3.2): `withdrawHidden` — the `"coinflow-payouts"`
   * feature flag controls visibility; `withdrawDisabled` — geo (US-only) +
   * signed-in control the enabled state (flag-on but non-US or signed-out
   * renders the button disabled rather than hidden).
   */
  withdrawHidden: boolean;
  withdrawDisabled: boolean;
  step: WithdrawStep;
  /**
   * Advances past the overview drawer into the flow proper (the WITHDRAW
   * button). Verification/KYC/bank gates run between here and the amount
   * step once their drawers land (plan steps 4–5).
   */
  beginWithdraw: () => void;
  /** Live withdrawal status; undefined until the query resolves. */
  status?: CoinflowWithdrawStatus;
  statusLoading: boolean;
  /** Set when the status query failed — the flow can't proceed without it. */
  statusError: Error | null;
  /**
   * Gross amount picked on the amount step, in whole account credits
   * (1 credit = $0.01, so numerically credits == cents); sent as `credits`
   * on the quote + withdrawal inputs.
   */
  credits?: number;
  setCredits: (credits: number | undefined) => void;
};

export const WithdrawContext = createContext<WithdrawContextValue>({
  isOpen: false,
  initiateWithdraw: () => {},
  closeWithdraw: () => {},
  withdrawHidden: true,
  withdrawDisabled: true,
  step: "overview",
  beginWithdraw: () => {},
  status: undefined,
  statusLoading: false,
  statusError: null,
  credits: undefined,
  setCredits: () => {},
});

export function WithdrawProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  // False while the overview drawer shows; beginWithdraw flips it to enter the
  // derived flow. Reset on close so every open starts at the overview.
  const [started, setStarted] = useState(false);
  const [credits, setCredits] = useState<number | undefined>();

  // Live gate: KYC state, destinations, bounds, active withdrawal. Only
  // fetched while the flow is open; refetch-on-focus (in the hook) covers the
  // hosted-KYC-window round-trip.
  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useCoinflowWithdrawStatus({
    enabled: isOpen,
  });

  // Entry-point gate (§3.2): the "coinflow-payouts" flag controls visibility;
  // geo (US-only) + signed-in control the enabled state. The button renders
  // disabled for non-US / signed-out users, and initiateWithdraw no-ops while
  // gated out so no call-site can bypass it.
  const { controller } = useConnection();
  const payoutsEnabled = useFeature("coinflow-payouts");
  const { isUS } = useGeoLocation();
  const withdrawHidden = !payoutsEnabled;
  const withdrawDisabled = !isUS || !controller;

  const initiateWithdraw = useCallback(() => {
    if (withdrawHidden || withdrawDisabled) return;
    setIsOpen(true);
  }, [withdrawHidden, withdrawDisabled]);

  const closeWithdraw = useCallback(() => {
    setIsOpen(false);
    setStarted(false);
    setCredits(undefined);
  }, []);

  // Enters the flow from the overview drawer. Requires the status to have
  // resolved — the derived step below is meaningless without it.
  const beginWithdraw = useCallback(() => {
    if (!status) return;
    setStarted(true);
  }, [status]);

  // "overview" until the user hits WITHDRAW; then derived per §3.1 of the
  // plan: kycStatus !== APPROVED → onboarding-kyc; no linked destination →
  // onboarding-bank; else the amount step. The "confirm"/"status"
  // progressions are driven by user actions once their drawers exist.
  const step = useMemo<WithdrawStep>(() => {
    if (!started) {
      return "overview";
    }
    if (!status || status.kycStatus !== CoinflowKycStatus.Approved) {
      return "onboarding-kyc";
    }
    if (status.destinations.length === 0) {
      return "onboarding-bank";
    }
    return "amount";
  }, [started, status]);

  return (
    <WithdrawContext.Provider
      value={{
        isOpen,
        initiateWithdraw,
        closeWithdraw,
        withdrawHidden,
        withdrawDisabled,
        step,
        beginWithdraw,
        status,
        statusLoading,
        statusError: (statusError as Error | null) ?? null,
        credits,
        setCredits,
      }}
    >
      {children}

      <WithdrawCredits isOpen={isOpen} onClose={closeWithdraw} />
    </WithdrawContext.Provider>
  );
}

export const useWithdrawContext = () => {
  const context = useContext(WithdrawContext);
  if (!context) {
    throw new Error(
      "useWithdrawContext must be used within a WithdrawProvider",
    );
  }
  return context;
};
