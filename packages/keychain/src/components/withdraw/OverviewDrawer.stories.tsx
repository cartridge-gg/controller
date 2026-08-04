import { PropsWithChildren, useState } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  CoinflowPayoutSpeed,
  CoinflowWithdrawalStatus,
  type CoinflowWithdrawal,
} from "@/hooks/payments/coinflow-withdraw";
import { OverviewDrawer } from "./OverviewDrawer";

// OverviewDrawer fetches its own withdrawal history via useCoinflowWithdrawals
// (react-query key ["CoinflowWithdrawal", {}]). Stories seed that cache rather
// than hit the network: a fresh client per story, marked fresh (staleTime
// Infinity, retry off) so the seeded rows render without a background refetch.
function SeededHistory({
  withdrawals,
  children,
}: PropsWithChildren<{ withdrawals: CoinflowWithdrawal[] }>) {
  const [client] = useState(() => {
    const c = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    c.setQueryData(["CoinflowWithdrawal", {}], {
      coinflowWithdrawal: withdrawals,
    });
    return c;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const withWithdrawals =
  (withdrawals: CoinflowWithdrawal[]): Decorator =>
  (Story) => (
    <SeededHistory withdrawals={withdrawals}>
      <Story />
    </SeededHistory>
  );

const PROCESSING_WITHDRAWAL: CoinflowWithdrawal = {
  id: "wd_2",
  status: CoinflowWithdrawalStatus.Processing,
  amountCents: 600,
  feeCents: 12,
  netCents: 588,
  method: CoinflowPayoutSpeed.Standard,
  effectiveSpeed: null,
  destinationDisplay: "Bank ****0283",
  failureCode: null,
  failureReason: null,
  createdAt: "2026-07-24T18:00:00Z",
  updatedAt: "2026-07-24T18:00:00Z",
  reversedAt: null,
};

const COMPLETED_WITHDRAWAL: CoinflowWithdrawal = {
  id: "wd_1",
  status: CoinflowWithdrawalStatus.Completed,
  amountCents: 2500,
  feeCents: 25,
  netCents: 2475,
  method: CoinflowPayoutSpeed.Standard,
  effectiveSpeed: null,
  destinationDisplay: "Bank ****0283",
  failureCode: null,
  failureReason: null,
  createdAt: "2026-07-20T12:00:00Z",
  updatedAt: "2026-07-21T09:00:00Z",
  reversedAt: null,
};

const meta = {
  component: OverviewDrawer,
  decorators: [
    (Story) => (
      <div className="relative w-[432px] h-[560px]">
        <Story />
      </div>
    ),
    // Default: no prior withdrawals — the History section shows its empty
    // placeholder. Stories that need history override this decorator.
    withWithdrawals([]),
  ],
  args: {
    isOpen: true,
    onClose: () => {},
    onWithdraw: () => {},
    onContinue: () => {},
    // Fixed policy bounds (not balance-clamped) + the balance; the effective
    // max the presets use is min(maxCredits, withdrawableCredits) = 613.
    minCredits: 600,
    maxCredits: 250000,
    withdrawableCredits: 613,
  },
} satisfies Meta<typeof OverviewDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** No prior withdrawals — the History section shows its empty placeholder. */
export const Default: Story = {};

/**
 * Withdrawal history — the section lists the two most recent (an in-flight
 * Processing card on top, a terminal Completed one below). The Processing row
 * locks the WITHDRAW button.
 */
export const WithHistory: Story = {
  decorators: [withWithdrawals([PROCESSING_WITHDRAWAL, COMPLETED_WITHDRAWAL])],
};

export const WithDailyLimit: Story = {
  args: {
    dailyLimit: { remainingCents: 15000, limitCents: 15000 },
  },
};

export const BelowMinimum: Story = {
  args: {
    withdrawableCredits: 13,
  },
};

export const Loading: Story = {
  args: {
    minCredits: undefined,
    maxCredits: undefined,
    withdrawableCredits: undefined,
    isLoading: true,
  },
};

/** Coinflow sandbox active — same standing warning as the deposit flow. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
};

/** Status query failed (e.g. Coinflow 401) — error alert + Close. */
export const ErrorState: Story = {
  args: {
    minCredits: undefined,
    maxCredits: undefined,
    withdrawableCredits: undefined,
    error: new Error(
      "coinflow API error (status 401): Error Processing your request",
    ),
  },
};

/** After WITHDRAW — amount selection revealed, empty input, Continue disabled. */
export const AmountEmpty: Story = {
  args: {
    amountMode: true,
  },
};

/** Valid amount within bounds — Continue enabled. */
export const AmountValid: Story = {
  args: {
    amountMode: true,
    defaultAmountValue: "6.13",
  },
};

/** Above the effective max (the $6.13 balance) — error label, Continue disabled. */
export const AmountOverMax: Story = {
  args: {
    amountMode: true,
    defaultAmountValue: "10.00",
  },
};

/** Below minCredits — error label, Continue disabled. */
export const AmountBelowMin: Story = {
  args: {
    amountMode: true,
    defaultAmountValue: "1.00",
  },
};
