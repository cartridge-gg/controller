import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseCredits, PurchaseState } from "./PurchaseCredits";

const meta = {
  component: PurchaseCredits,
} satisfies Meta<typeof PurchaseCredits>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    wallets: [
      {
        type: "metamask",
        available: true,
      },
      {
        type: "phantom",
        platform: "solana",
        available: true,
      },
      {
        type: "argent",
        available: true,
      },
    ],
  },
};

export const Success: Story = {
  args: {
    wallets: [],
    initState: PurchaseState.SUCCESS,
  },
};
