import type { Meta, StoryObj } from "@storybook/react";
import { ChooseNetwork } from "./network";
import { networkWalletData } from "./wallet/data";

const meta = {
  component: ChooseNetwork,
} satisfies Meta<typeof ChooseNetwork>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: networkWalletData,
    onNetworkSelect: (networkId: string) =>
      console.log("Selected network:", networkId),
    onCancel: () => console.log("Cancelled"),
  },
};
