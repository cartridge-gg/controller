import type { Meta, StoryObj } from "@storybook/react";
import { SelectWallet } from "./wallet";
import { ReactNode, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { StarterpackContext } from "@/context/starterpack/starterpack";
import {
  OnchainPurchaseContext,
  OnchainPurchaseContextType,
  TokenOption,
} from "@/context/starterpack/onchain-purchase";

// Mock starterpack context
const mockStarterpackValue = {
  starterpackId: undefined,
  setStarterpackId: () => {},
  starterpackDetails: undefined,
  isStarterpackLoading: false,
  claimItems: [],
  setClaimItems: () => {},
  transactionHash: undefined,
  setTransactionHash: () => {},
  displayError: undefined,
  setDisplayError: () => {},
  clearError: () => {},
};

// Mock onchain purchase context
const mockOnchainPurchaseValue: OnchainPurchaseContextType = {
  purchaseItems: [],
  quantity: 1,
  incrementQuantity: () => {},
  decrementQuantity: () => {},
  selectedWallet: undefined,
  selectedPlatform: undefined,
  walletAddress: undefined,
  clearSelectedWallet: () => {},
  availableTokens: [] as TokenOption[],
  selectedToken: undefined,
  setSelectedToken: () => {},
  convertedPrice: null,
  swapQuote: null,
  isFetchingConversion: false,
  isTokenSelectionLocked: false,
  isSendingDeposit: false,
  conversionError: null,
  usdAmount: 0,
  layerswapFees: undefined,
  isFetchingFees: false,
  feeEstimationError: null,
  swapId: undefined,
  explorer: undefined,
  requestedAmount: undefined,
  setRequestedAmount: () => {},
  depositAmount: undefined,
  onOnchainPurchase: async () => {},
  onExternalConnect: async () => undefined,
  onSendDeposit: async () => {},
  waitForDeposit: async () => false,
  isApplePaySelected: false,
  paymentLink: undefined,
  isCreatingOrder: false,
  coinbaseQuote: undefined,
  isFetchingCoinbaseQuote: false,
  onApplePaySelect: () => {},
  onCreateCoinbaseOrder: async () => {},
  getTransactions: async () => [],
};

// Component that navigates to the correct route on mount
const NavigateToRoute = ({ platforms }: { platforms: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/purchase/wallet/${platforms}`, { replace: true });
  }, [navigate, platforms]);

  return null;
};

// Provider wrapper that sets up missing contexts with route params
const WalletStoryWrapper = ({
  children,
  platforms,
}: {
  children: ReactNode;
  platforms: string;
}) => {
  return (
    <StarterpackContext.Provider value={mockStarterpackValue}>
      <OnchainPurchaseContext.Provider value={mockOnchainPurchaseValue}>
        <NavigateToRoute platforms={platforms} />
        <Routes>
          <Route path="/purchase/wallet/:platforms" element={children} />
          {/* Fallback route to show loading state while navigating */}
          <Route path="*" element={<div>Loading...</div>} />
        </Routes>
      </OnchainPurchaseContext.Provider>
    </StarterpackContext.Provider>
  );
};

const meta = {
  component: SelectWallet,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SelectWallet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StarknetWallets: Story = {
  decorators: [
    (Story) => (
      <WalletStoryWrapper platforms="starknet">
        <Story />
      </WalletStoryWrapper>
    ),
  ],
};

export const EthereumWallets: Story = {
  decorators: [
    (Story) => (
      <WalletStoryWrapper platforms="ethereum">
        <Story />
      </WalletStoryWrapper>
    ),
  ],
};

export const SolanaWallets: Story = {
  decorators: [
    (Story) => (
      <WalletStoryWrapper platforms="solana">
        <Story />
      </WalletStoryWrapper>
    ),
  ],
};

export const BaseWallets: Story = {
  decorators: [
    (Story) => (
      <WalletStoryWrapper platforms="base">
        <Story />
      </WalletStoryWrapper>
    ),
  ],
};

export const MultipleNetworks: Story = {
  decorators: [
    (Story) => (
      <WalletStoryWrapper platforms="starknet;ethereum;base">
        <Story />
      </WalletStoryWrapper>
    ),
  ],
};
