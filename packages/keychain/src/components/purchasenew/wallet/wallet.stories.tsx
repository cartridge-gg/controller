import type { Meta, StoryObj } from "@storybook/react";
import { SelectWallet } from "./wallet";
import { networkWalletData } from "./data";

const meta = {
  component: SelectWallet,
} satisfies Meta<typeof SelectWallet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StarknetWallets: Story = {
  args: {
    data: networkWalletData,
    selectedNetworkId: "starknet",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
    onBack: () => console.log("Go back"),
  },
};

export const EthereumWallets: Story = {
  args: {
    data: networkWalletData,
    selectedNetworkId: "ethereum",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
    onBack: () => console.log("Go back"),
  },
};

export const SolanaWallets: Story = {
  args: {
    data: networkWalletData,
    selectedNetworkId: "solana",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
    onBack: () => console.log("Go back"),
  },
};

export const BaseWallets: Story = {
  args: {
    data: networkWalletData,
    selectedNetworkId: "base",
    onWalletSelect: (walletId: string) =>
      console.log("Selected wallet:", walletId),
    onBack: () => console.log("Go back"),
  },
};
