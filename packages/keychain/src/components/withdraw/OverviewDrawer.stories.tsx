import type { Meta, StoryObj } from "@storybook/react";

import { OverviewDrawer } from "./OverviewDrawer";

const meta = {
  component: OverviewDrawer,
  decorators: [
    (Story) => (
      <div className="relative w-[432px] h-[560px]">
        <Story />
      </div>
    ),
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

export const Default: Story = {};

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
