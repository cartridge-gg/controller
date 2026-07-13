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
 * Flow steps, derived from live data (mirrors DepositCredits' derived step) —
 * never a manually-advanced counter. A returning, fully-onboarded user lands
 * on "amount" automatically; a mid-flow KYC failure demotes the step back to
 * "onboarding-kyc". "confirm"/"status" progressions land with their drawers.
 */
export type WithdrawStep =
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
  /** Live withdrawal status; undefined until the query resolves. */
  status?: CoinflowWithdrawStatus;
  statusLoading: boolean;
};

export const WithdrawContext = createContext<WithdrawContextValue>({
  isOpen: false,
  initiateWithdraw: () => {},
  closeWithdraw: () => {},
  withdrawHidden: true,
  withdrawDisabled: true,
  step: "onboarding-kyc",
  status: undefined,
  statusLoading: false,
});

export function WithdrawProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  // Live gate: KYC state, destinations, bounds, active withdrawal. Only
  // fetched while the flow is open; refetch-on-focus (in the hook) covers the
  // hosted-KYC-window round-trip.
  const { data: status, isLoading: statusLoading } = useCoinflowWithdrawStatus({
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
  }, []);

  // Derived per §3.1 of the plan: kycStatus !== APPROVED → onboarding-kyc;
  // no linked destination → onboarding-bank; else the amount step. The
  // "confirm"/"status" progressions are driven by user actions once their
  // drawers exist.
  const step = useMemo<WithdrawStep>(() => {
    if (!status || status.kycStatus !== CoinflowKycStatus.Approved) {
      return "onboarding-kyc";
    }
    if (status.destinations.length === 0) {
      return "onboarding-bank";
    }
    return "amount";
  }, [status]);

  return (
    <WithdrawContext.Provider
      value={{
        isOpen,
        initiateWithdraw,
        closeWithdraw,
        withdrawHidden,
        withdrawDisabled,
        step,
        status,
        statusLoading,
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
