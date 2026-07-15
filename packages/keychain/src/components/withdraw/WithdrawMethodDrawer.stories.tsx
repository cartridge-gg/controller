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
    onSelect: () => {},
    destinations: [bank],
    credits: 613,
  },
} satisfies Meta<typeof WithdrawMethodDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Nothing highlighted yet — the WITHDRAW button stays disabled. */
export const Default: Story = {};

/** Bank highlighted — "Transfer to:" summary + WITHDRAW enabled. */
export const Selected: Story = {
  args: {
    selectedToken: bank.token,
  },
};

/** Several linked destinations, card highlighted. */
export const MultipleDestinations: Story = {
  args: {
    destinations: [card, bank],
    selectedToken: card.token,
  },
};

/** Coinflow sandbox active — same standing warning as the other drawers. */
export const Sandbox: Story = {
  args: {
    sandbox: true,
  },
};
