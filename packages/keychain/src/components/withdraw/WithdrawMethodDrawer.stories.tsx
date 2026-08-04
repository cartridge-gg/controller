import type { Meta, StoryObj } from "@storybook/react";

import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
} from "@/hooks/payments/coinflow-withdraw";
import { WithdrawMethodDrawer } from "./WithdrawMethodDrawer";

const bank = {
  type: CoinflowDestinationType.Bank,
  token: "bank-token-1",
  display: "Bank ****0283",
  supportedSpeeds: [CoinflowPayoutSpeed.Standard],
};

const meta = {
  component: WithdrawMethodDrawer,
  decorators: [
    (Story) => (
      <div className="relative w-[432px] h-[640px]">
        <Story />
      </div>
    ),
  ],
  args: {
    isOpen: true,
    onClose: () => {},
    onSelectMethod: () => {},
    onResetSelection: () => {},
    onLink: () => {},
    destinations: [bank],
    credits: 613,
  },
} satisfies Meta<typeof WithdrawMethodDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Bank linked, no quote yet — the WITHDRAW button stays disabled. */
export const Default: Story = {};

/** Quote resolved — fee on the row, account in "Transfer to:", WITHDRAW shows net. */
export const Quoted: Story = {
  args: {
    quote: {
      amountCents: 613,
      feeCents: 25,
      netCents: 588,
      remainingLimitCents: null,
      eta: null,
    },
  },
};

/** Quote in flight — the fee row shows the calculating spinner. */
export const Quoting: Story = {
  args: {
    quoteLoading: true,
  },
};

/** The quote request failed — the fee row surfaces the fallback, button disabled. */
export const QuoteError: Story = {
  args: {
    quoteError: new Error("temporarily unavailable"),
  },
};

/**
 * No linked account of the type — the button becomes "Link Account" and there's
 * no fee row or "Transfer to:" summary until an account is linked.
 */
export const NoLinkedAccount: Story = {
  args: {
    destinations: [],
  },
};

/** Coinflow sandbox active — same standing warning as the other drawers. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
};
