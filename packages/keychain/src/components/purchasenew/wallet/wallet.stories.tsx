import type { Meta, StoryObj } from "@storybook/react";
import { SelectWallet } from "./wallet";
import { NavigationProvider } from "@/context";

const meta = {
  component: SelectWallet,
  decorators: [
    (Story) => (
      <NavigationProvider>
        <Story />
      </NavigationProvider>
    ),
  ],
} satisfies Meta<typeof SelectWallet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StarknetWallets: Story = {
  args: {
    selectedNetworkId: "starknet",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
  },
};

export const EthereumWallets: Story = {
  args: {
    selectedNetworkId: "ethereum",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
  },
};

export const SolanaWallets: Story = {
  args: {
    selectedNetworkId: "solana",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
  },
};

export const BaseWallets: Story = {
  args: {
    selectedNetworkId: "base",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
  },
};
