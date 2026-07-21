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
  supportedSpeeds: [CoinflowPayoutSpeed.Standard, CoinflowPayoutSpeed.SameDay],
};

const bank2 = {
  type: CoinflowDestinationType.Bank,
  token: "bank-token-2",
  display: "Bank ****9999",
  supportedSpeeds: [CoinflowPayoutSpeed.Standard],
};

const card = {
  type: CoinflowDestinationType.Card,
  token: "card-token-1",
  display: "Debit Card ****4242",
  supportedSpeeds: [CoinflowPayoutSpeed.Asap],
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
    destinations: [bank],
    credits: 613,
  },
} satisfies Meta<typeof WithdrawMethodDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** No card picked yet — the WITHDRAW button stays disabled (no quote). */
export const Default: Story = {};

/** A card picked, quote resolved — fee on the card + row, WITHDRAW shows net. */
export const Quoted: Story = {
  args: {
    selection: { token: bank.token, speed: CoinflowPayoutSpeed.Standard },
    quote: {
      amountCents: 613,
      feeCents: 25,
      netCents: 588,
      remainingLimitCents: null,
      eta: null,
    },
  },
};

/** A card picked, quote in flight — the card shows the calculating spinner. */
export const Quoting: Story = {
  args: {
    selection: { token: bank.token, speed: CoinflowPayoutSpeed.Standard },
    quoteLoading: true,
  },
};

/** The quote request failed — the card surfaces the fallback, button disabled. */
export const QuoteError: Story = {
  args: {
    selection: { token: bank.token, speed: CoinflowPayoutSpeed.Standard },
    quoteError: new Error("temporarily unavailable"),
  },
};

/**
 * Several destinations, each fanned out to one card per available speed. The
 * card destination (Asap only) and the bank's Same Day speed are filtered out,
 * leaving one Standard card per bank.
 */
export const MultipleDestinations: Story = {
  args: {
    destinations: [card, bank, bank2],
  },
};

/** Coinflow sandbox active — same standing warning as the other drawers. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
};
