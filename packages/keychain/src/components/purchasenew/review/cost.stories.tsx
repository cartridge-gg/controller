import type { Meta, StoryObj } from "@storybook/react";

import { CostBreakdown } from "./cost";
import { StarterpackProviders } from "@/context";
import { WalletType } from "@cartridge/ui";

const meta: Meta<typeof CostBreakdown> = {
  component: CostBreakdown,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <StarterpackProviders>
        <div className="w-[400px]">
          <Story />
        </div>
      </StarterpackProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutFee: Story = {
  args: {
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 0,
      totalInCents: 1000,
    },
    rails: "stripe",
  },
};

export const WithCartridgeFee: Story = {
  args: {
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 25,
      totalInCents: 1025,
    },
    rails: "crypto",
    walletType: WalletType.Controller,
  },
};

export const WithStripeFee: Story = {
  args: {
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 89,
      totalInCents: 1089,
    },
    rails: "stripe",
  },
};
