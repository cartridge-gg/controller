import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CoinflowKycStatus,
  useCoinflowBankAuthSession,
  useCoinflowWithdrawal,
  useCoinflowWithdrawStatus,
  type CoinflowBankAuthSession,
  type CoinflowDestination,
  type CoinflowWithdrawal,
} from "@/hooks/payments/coinflow-withdraw";
import type { CoinflowWithdrawStatusQuery } from "@/utils/api";
import { useConnection } from "@/hooks/connection";
import { useFeature } from "@/hooks/features";
import { useGeoLocation } from "@/hooks/geo";
import { useIdentityContext } from "@/components/identity/provider";
import { useWithdrawQuote, type WithdrawQuote } from "./useWithdrawQuote";
import { useWithdrawSubmit, type WithdrawSubmit } from "./useWithdrawSubmit";
import { WithdrawCredits } from "./WithdrawCredits";

export type CoinflowWithdrawStatus =
  CoinflowWithdrawStatusQuery["coinflowWithdrawStatus"];

/**
 * Flow steps. "overview" (the Withdraw Funds summary drawer) shows first on
 * every open; past it the step is derived from live data (mirrors
 * DepositCredits' derived step) — never a manually-advanced counter.
 * "verification" is the email/phone/identity gauntlet (the same identity
 * required by the credit-card on-ramp); it re-appears automatically if the
 * identity provider reports a verification as invalidated or deleted. A
 * returning, fully-onboarded user lands on "amount" automatically; a mid-flow
 * KYC failure demotes the step back to "onboarding-kyc". "select-method" and
 * "add-bank" are user-action sub-steps of "amount": Continue with no confirmed
 * transfer method opens the method picker (or the add-bank form when nothing
 * is linked yet), and both return to "amount". "confirm"/"status" progressions
 * land with their drawers.
 */
export type WithdrawStep =
  | "overview"
  | "verification"
  | "onboarding-kyc"
  | "amount"
  | "select-method"
  | "add-bank"
  | "confirm"
  | "status";

export type WithdrawContextValue = {
  isOpen: boolean;
  /** Opens the withdraw flow (from NavigationHeader onWithdraw). */
  initiateWithdraw: () => void;
  /**
   * Opens the flow in "add-bank" intent: runs the same verification → KYC →
   * hosted bank-link gauntlet as the withdraw flow, but skips the
   * overview/amount/quote steps and closes once a destination is linked (the
   * shared status query refreshes, so any bank list re-renders). Entry point
   * for the settings "Add Payment Method" button. Same gate as
   * `initiateWithdraw` (feature flag + US + signed-in).
   */
  initiateAddBank: () => void;
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
   * button). The verification/KYC gates run between here and the amount step
   * (the bank gate lands with plan step 5).
   */
  beginWithdraw: () => void;
  /**
   * Cancels the in-flight gate (verification gauntlet or KYC drawer) back to
   * the overview drawer; clicking WITHDRAW again resumes at the first
   * incomplete gate — completed verifications are never requested twice.
   */
  returnToOverview: () => void;
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
  /**
   * The confirmed transfer method — a linked Coinflow destination. Undefined
   * until the user picks one on the method drawer (or links a bank account);
   * the overview drawer's amount step renders it as SelectedWithdrawMethod.
   */
  selectedDestination?: CoinflowDestination;
  /** Confirms a destination and returns to the amount step. */
  selectDestination: (destination: CoinflowDestination) => void;
  /**
   * Opens the transfer-method sub-step: the picker when destinations exist,
   * the add-bank hosted UI otherwise (amount Continue with no confirmed method,
   * or the SelectedWithdrawMethod change affordance).
   */
  openMethodSelection: () => void;
  /** Cancels the method sub-step back to the amount step. */
  closeMethodSelection: () => void;
  /**
   * Coinflow hosted Bank Authentication UI (§3.4). The provider owns the
   * session (minted via `useCoinflowBankAuthSession`); `BankAuthDrawer` is a
   * thin view that reads `session` and renders the `CoinflowWithdraw` iframe.
   * `onLinked` (the iframe success/`accountLinked` event) refetches the status
   * so the freshly-linked destination lists, then returns to the method picker.
   */
  bankAuth: {
    session?: CoinflowBankAuthSession;
    isMinting: boolean;
    /**
     * True from the iframe's success event until the refetched status contains
     * the freshly-linked destination — drives the drawer's loading state so it
     * holds instead of flashing an empty picker before navigating.
     */
    isLinking: boolean;
    error: Error | null;
    onLinked: () => void;
  };
  /**
   * The transfer-method quote (§3.5). The provider owns it here; its selection
   * + fetch logic live in `useWithdrawQuote`. The method drawer reads
   * `quote.data`/`isLoading`/`error` and calls `quote.select` as cards are
   * clicked, quoting the chosen destination + speed for the picked `credits`.
   */
  quote: WithdrawQuote;
  /**
   * The final payout (§3.6): initiates the withdrawal for the confirmed amount
   * + method and reports its return status. The provider owns it here (logic in
   * `useWithdrawSubmit`); the method drawer's WITHDRAW button calls
   * `submit.submit` and reads `submit.isLoading`/`submit.error`. On success the
   * flow returns to the overview drawer, now listing the new withdrawal below.
   */
  submit: WithdrawSubmit;
  /**
   * The active (in-flight) withdrawal, resolved from `activeWithdrawalId` — the
   * overview History card. Undefined when none is in flight.
   */
  activeWithdrawal?: CoinflowWithdrawal;
  /** The active-withdrawal lookup is in flight. */
  activeWithdrawalLoading: boolean;
};

export const WithdrawContext = createContext<WithdrawContextValue>({
  isOpen: false,
  initiateWithdraw: () => {},
  initiateAddBank: () => {},
  closeWithdraw: () => {},
  withdrawHidden: true,
  withdrawDisabled: true,
  step: "overview",
  beginWithdraw: () => {},
  returnToOverview: () => {},
  status: undefined,
  statusLoading: false,
  statusError: null,
  credits: undefined,
  setCredits: () => {},
  selectedDestination: undefined,
  selectDestination: () => {},
  openMethodSelection: () => {},
  closeMethodSelection: () => {},
  bankAuth: {
    session: undefined,
    isMinting: false,
    isLinking: false,
    error: null,
    onLinked: () => {},
  },
  quote: {
    selection: undefined,
    select: () => {},
    reset: () => {},
    data: undefined,
    isLoading: false,
    error: null,
  },
  submit: {
    submit: () => {},
    isLoading: false,
    error: null,
    reset: () => {},
  },
  activeWithdrawal: undefined,
  activeWithdrawalLoading: false,
});

export function WithdrawProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  // Why the flow was opened. "withdraw" is the full off-ramp; "add-bank" runs
  // only the verification → KYC → bank-link gauntlet (settings "Add Payment
  // Method") and closes once a destination lands. Reset on close.
  const [intent, setIntent] = useState<"withdraw" | "add-bank">("withdraw");
  // False while the overview drawer shows; beginWithdraw flips it to enter the
  // derived flow. Reset on close so every open starts at the overview.
  const [started, setStarted] = useState(false);
  const [credits, setCredits] = useState<number | undefined>();
  // The method sub-step in flight ("select" = picker drawer, "add" = bank
  // form) and the confirmed destination. Entered from the amount step, never
  // derived — a user with a linked bank still confirms it explicitly.
  const [methodFlow, setMethodFlow] = useState<"none" | "select" | "add">(
    "none",
  );
  const [selectedDestination, setSelectedDestination] = useState<
    CoinflowDestination | undefined
  >();
  // True while the linked destination settles into the refetched status (see
  // onBankLinked) — drives the add-bank drawer's loader through the round-trip.
  const [isLinking, setIsLinking] = useState(false);

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

  // Hosted Bank Authentication UI session (§3.4). Owned here; BankAuthDrawer
  // only reads `session`. `launch()` mints it when the add-bank step is entered.
  const bankAuthSession = useCoinflowBankAuthSession();

  // Transfer-method quote (§3.5). Owned here; the method drawer reads it and
  // calls `quote.select` as cards are clicked. Keyed on the picked `credits`,
  // so it re-quotes automatically if the amount changes.
  const quote = useWithdrawQuote(credits);

  // The active (in-flight) withdrawal for the overview History card. Resolved
  // from `activeWithdrawalId` (the backend keeps one active per user); a
  // successful initiation refetches the status so this id lands, then this
  // query pulls the row. Only fetched while the flow is open.
  const { data: activeWithdrawal, isLoading: activeWithdrawalLoading } =
    useCoinflowWithdrawal(status?.activeWithdrawalId ?? undefined, {
      enabled: isOpen && !!status?.activeWithdrawalId,
    });

  // Lands back on the overview drawer after a successful initiation — as if
  // freshly opened from the menu, its History section now listing the new
  // withdrawal. Clears the picked amount/method/quote so the next withdrawal
  // starts fresh; leaves the drawer open (isOpen untouched).
  const onWithdrawSuccess = useCallback(() => {
    setStarted(false);
    setMethodFlow("none");
    setCredits(undefined);
    setSelectedDestination(undefined);
    quote.reset();
  }, [quote]);

  // The final payout (§3.6). Owned here; the method drawer's WITHDRAW button
  // drives it. Keyed on the picked amount + the quote's confirmed selection.
  const submit = useWithdrawSubmit({
    credits,
    selection: quote.selection,
    onSuccess: onWithdrawSuccess,
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
    setIntent("withdraw");
    setIsOpen(true);
  }, [withdrawHidden, withdrawDisabled]);

  // Enters "add-bank" intent directly (no overview): `started` flips on so the
  // step derives straight into the verification/KYC/bank-link gauntlet.
  // `status` is available from the shared query cache (the settings section
  // observes the same key), so the derived onboarding-kyc/add-bank steps always
  // have it — mirroring beginWithdraw's status guard.
  const initiateAddBank = useCallback(() => {
    if (withdrawHidden || withdrawDisabled || !status) return;
    setIntent("add-bank");
    setIsOpen(true);
    setStarted(true);
  }, [withdrawHidden, withdrawDisabled, status]);

  const closeWithdraw = useCallback(() => {
    setIsOpen(false);
    setIntent("withdraw");
    setStarted(false);
    setCredits(undefined);
    setMethodFlow("none");
    setSelectedDestination(undefined);
    setIsLinking(false);
    bankAuthSession.reset();
    quote.reset();
  }, [bankAuthSession, quote]);

  // Enters the flow from the overview drawer. Requires the status to have
  // resolved — the derived step below is meaningless without it.
  const beginWithdraw = useCallback(() => {
    if (!status) return;
    setStarted(true);
  }, [status]);

  // Cancels an in-flight gate back to the overview; WITHDRAW resumes at the
  // first incomplete gate (the derived step recomputes from live data). In
  // add-bank intent there is no overview to fall back to, so a cancel closes
  // the flow.
  const returnToOverview = useCallback(() => {
    if (intent === "add-bank") {
      closeWithdraw();
      return;
    }
    setStarted(false);
    setMethodFlow("none");
  }, [intent, closeWithdraw]);

  // Enters the method sub-step from the amount step: pick among the linked
  // destinations, or straight to the hosted add-bank UI when nothing is linked
  // yet — minting its session as the step opens (the drawer renders a loader
  // until it lands).
  const openMethodSelection = useCallback(() => {
    if (!status) return;
    // Fresh picker every open — a stale card selection would otherwise show a
    // quote for a method the user hasn't re-picked; a stale submit error would
    // linger on the reopened drawer.
    quote.reset();
    submit.reset();
    if (status.destinations.length === 0) {
      setMethodFlow("add");
      bankAuthSession.launch().catch(() => {});
      return;
    }
    setMethodFlow("select");
  }, [status, bankAuthSession, quote, submit]);

  const closeMethodSelection = useCallback(() => {
    // In add-bank intent the bank-link drawer is the whole flow — cancelling it
    // closes, rather than returning to the (skipped) amount step.
    if (intent === "add-bank") {
      closeWithdraw();
      return;
    }
    setMethodFlow("none");
    bankAuthSession.reset();
    quote.reset();
    submit.reset();
  }, [intent, closeWithdraw, bankAuthSession, quote, submit]);

  // The hosted iframe linked a destination: refetch the live status so it
  // lists, then hand back to the method picker (now non-empty) to confirm it.
  // We select from the refreshed status rather than the iframe payload — the
  // status query is the single source of truth for destinations.
  const onBankLinked = useCallback(async () => {
    setIsLinking(true);
    // Await the refetch (invalidateQueries resolves once the active status
    // refetch settles) so the picker lands on a status that already lists the
    // new destination — no empty-picker flash between the iframe and the pick.
    await bankAuthSession.onLinked();
    // In add-bank intent, linking is the whole task: the refreshed status now
    // lists the destination (the same query the settings list observes), so
    // just close — no picker to return to.
    if (intent === "add-bank") {
      closeWithdraw();
      return;
    }
    bankAuthSession.reset();
    setMethodFlow("select");
    setIsLinking(false);
  }, [bankAuthSession, intent, closeWithdraw]);

  // Confirms a destination (picked on the method drawer, or freshly returned
  // by createCoinflowBankAccount) and lands back on the amount step.
  const selectDestination = useCallback((destination: CoinflowDestination) => {
    setSelectedDestination(destination);
    setMethodFlow("none");
  }, []);

  // Email/phone/identity are derived live from the identity provider, so a
  // verification that gets invalidated or deleted upstream re-gates the flow
  // automatically — completed ones are never requested twice.
  const { isEmailVerified, isPhoneNumberVerified, isIdentityVerified } =
    useIdentityContext();
  const isIdentityGateVerified =
    isEmailVerified && isPhoneNumberVerified && isIdentityVerified;

  // "overview" until the user hits WITHDRAW; then derived per §3.1 of the
  // plan: email/phone/identity not all verified → verification; kycStatus
  // !== APPROVED → onboarding-kyc; else the amount step. The method sub-steps
  // are user-action-driven from there (amount Continue / change affordance),
  // not derived — as the "confirm"/"status" progressions will be.
  const step = useMemo<WithdrawStep>(() => {
    if (!started) {
      return "overview";
    }
    if (!isIdentityGateVerified) {
      return "verification";
    }
    if (!status || status.kycStatus !== CoinflowKycStatus.Approved) {
      return "onboarding-kyc";
    }
    // Add-bank intent goes straight to the hosted bank-link once the identity
    // and KYC gates clear — no amount/method steps.
    if (intent === "add-bank") {
      return "add-bank";
    }
    if (methodFlow === "add") {
      return "add-bank";
    }
    if (methodFlow === "select") {
      return "select-method";
    }
    return "amount";
  }, [started, isIdentityGateVerified, status, methodFlow, intent]);

  // In add-bank intent nothing calls openMethodSelection to mint the hosted
  // session, so mint it when the derived step lands on the bank-link (once the
  // gates clear). The withdraw intent mints it in openMethodSelection instead.
  const { launch: launchBankAuth } = bankAuthSession;
  const bankAuthSessionData = bankAuthSession.session;
  const bankAuthMinting = bankAuthSession.isMinting;
  useEffect(() => {
    if (intent !== "add-bank" || step !== "add-bank") return;
    if (bankAuthSessionData || bankAuthMinting) return;
    launchBankAuth().catch(() => {});
  }, [intent, step, bankAuthSessionData, bankAuthMinting, launchBankAuth]);

  return (
    <WithdrawContext.Provider
      value={{
        isOpen,
        initiateWithdraw,
        initiateAddBank,
        closeWithdraw,
        withdrawHidden,
        withdrawDisabled,
        step,
        beginWithdraw,
        returnToOverview,
        status,
        statusLoading,
        statusError: (statusError as Error | null) ?? null,
        credits,
        setCredits,
        selectedDestination,
        selectDestination,
        openMethodSelection,
        closeMethodSelection,
        bankAuth: {
          session: bankAuthSession.session,
          isMinting: bankAuthSession.isMinting,
          isLinking,
          error: bankAuthSession.error,
          onLinked: onBankLinked,
        },
        quote,
        submit,
        activeWithdrawal,
        activeWithdrawalLoading,
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
