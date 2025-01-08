import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseCredits } from "./PurchaseCredits";

const meta = {
  component: PurchaseCredits,
  parameters: {
    connection: {
      controller: {
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        username: () => "user",
      },
    },
  },
} satisfies Meta<typeof PurchaseCredits>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
