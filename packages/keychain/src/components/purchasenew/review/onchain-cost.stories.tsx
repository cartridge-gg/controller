import type { Meta, StoryObj } from "@storybook/react";
import { OnchainCostBreakdown } from "./cost";
import {
  OnchainPurchaseContext,
  OnchainPurchaseContextType,
  TokenOption,
} from "@/context/starterpack/onchain-purchase";
import { ReactNode } from "react";

// USDC address with leading zeros (tests normalization)
const USDC_ADDRESS =
  "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";

// Mock token for stories (minimal mock for display purposes)
const mockUsdcToken = {
  address: USDC_ADDRESS,
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  icon: "https://static.cartridge.gg/tokens/usdc.svg",
  contract: {} as TokenOption["contract"],
} satisfies TokenOption;

// Mock provider for stories
const MockOnchainPurchaseProvider = ({ children }: { children: ReactNode }) => {
  const mockValue: OnchainPurchaseContextType = {
    purchaseItems: [],
    quantity: 1,
    incrementQuantity: () => {},
    decrementQuantity: () => {},
    selectedWallet: undefined,
    selectedPlatform: undefined,
    walletAddress: undefined,
    clearSelectedWallet: () => {},
    availableTokens: [mockUsdcToken],
    selectedToken: mockUsdcToken,
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

  return (
    <OnchainPurchaseContext.Provider value={mockValue}>
      {children}
    </OnchainPurchaseContext.Provider>
  );
};

const meta = {
  component: OnchainCostBreakdown,
  decorators: [
    (Story) => (
      <MockOnchainPurchaseProvider>
        <Story />
      </MockOnchainPurchaseProvider>
    ),
  ],
  argTypes: {
    quote: {
      control: false, // Disable controls for BigInt serialization
    },
  },
} satisfies Meta<typeof OnchainCostBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// USDC payment example with referral
export const USDCPayment: Story = {
  args: {
    quote: {
      basePrice: 100000000n, // $100 USDC (6 decimals)
      protocolFee: 2500000n, // $2.50 protocol fee
      referralFee: 5000000n, // $5 USDC referral fee
      totalCost: 107500000n, // $107.50 total
      paymentToken: USDC_ADDRESS,
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
    platform: "starknet",
  },
};

// ETH payment example (18 decimals)
export const ETHPayment: Story = {
  args: {
    quote: {
      basePrice: 50000000000000000n, // 0.05 ETH
      protocolFee: 1250000000000000n, // 0.00125 ETH
      referralFee: 2500000000000000n, // 0.0025 ETH
      totalCost: 53750000000000000n, // 0.05375 ETH
      paymentToken:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH on Starknet
      paymentTokenMetadata: {
        symbol: "ETH",
        decimals: 18,
      },
    },
    platform: "starknet",
  },
};

// No referral fee (tooltip still shows, just hides referral line)
export const NoReferral: Story = {
  args: {
    quote: {
      basePrice: 50000000n, // $50 USDC
      protocolFee: 1250000n, // $1.25 protocol fee
      referralFee: 0n, // No referral
      totalCost: 51250000n, // $51.25 total
      paymentToken: USDC_ADDRESS,
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
    platform: "base",
  },
};

// With tooltip open
export const WithTooltipOpen: Story = {
  args: {
    quote: {
      basePrice: 25000000n, // $25 USDC
      protocolFee: 625000n, // $0.625 protocol fee
      referralFee: 1250000n, // $1.25 referral
      totalCost: 26875000n, // $26.875 total
      paymentToken: USDC_ADDRESS,
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
    platform: "ethereum",
    openFeesTooltip: true,
  },
};
