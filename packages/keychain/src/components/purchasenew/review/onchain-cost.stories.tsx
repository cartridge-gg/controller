import type { Meta, StoryObj } from "@storybook/react";
import { OnchainCostBreakdown } from "./cost";
import { PurchaseContext } from "@/context/purchase";
import { ItemType, type Item, type PurchaseContextType } from "@/context";
import type { TokenOption } from "@/context";
import { TOKEN_ICONS } from "@/constants";

// USDC address with leading zeros (tests normalization)
const USDC_ADDRESS =
  "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";

const MockPurchaseProvider = ({
  children,
  purchaseItems = [],
  availableTokens = [],
  convertedPrice = null,
}: {
  children: React.ReactNode;
  purchaseItems?: Item[];
  availableTokens?: Omit<TokenOption, "contract">[];
  convertedPrice?: {
    amount: bigint;
    tokenMetadata: {
      symbol: string;
      decimals: number;
    };
  } | null;
}) => {
  const mockContext: PurchaseContextType = {
    usdAmount: 100,
    purchaseItems,
    claimItems: [],
    layerswapFees: undefined,
    isFetchingFees: false,
    selectedPlatform: "ethereum",
    stripePromise: Promise.resolve(null),
    isStripeLoading: false,
    isCryptoLoading: false,
    isStarterpackLoading: false,
    clearError: () => {},
    clearSelectedWallet: () => {},
    availableTokens: availableTokens as TokenOption[],
    convertedPrice,
    swapQuote: null,
    isFetchingConversion: false,
    conversionError: null,
    setUsdAmount: () => {},
    setPurchaseItems: () => {},
    setClaimItems: () => {},
    setStarterpack: () => {},
    setTransactionHash: () => {},
    setSelectedToken: () => {},
    onCreditCardPurchase: async () => {},
    onBackendCryptoPurchase: async () => {},
    onOnchainPurchase: async () => {},
    onExternalConnect: async () => undefined,
    waitForPayment: async () => true,
    fetchFees: async () => {},
  };

  return (
    <PurchaseContext.Provider value={mockContext}>
      {children}
    </PurchaseContext.Provider>
  );
};

// Extend the component args to include mock data
type StoryArgs = React.ComponentProps<typeof OnchainCostBreakdown> & {
  mockPurchaseItems?: Item[];
  mockAvailableTokens?: Omit<TokenOption, "contract">[];
  mockConvertedPrice?: {
    amount: string; // String to avoid BigInt serialization
    tokenMetadata: {
      symbol: string;
      decimals: number;
    };
  };
};

const meta = {
  parameters: {
    layout: "centered",
  },
  component: OnchainCostBreakdown,
  argTypes: {
    quote: {
      control: false, // Disable controls for BigInt serialization
    },
  },
  decorators: [
    (Story, { args }) => {
      // Convert mockConvertedPrice with string amount to BigInt
      const convertedPrice = args.mockConvertedPrice
        ? {
            amount: BigInt(args.mockConvertedPrice.amount),
            tokenMetadata: args.mockConvertedPrice.tokenMetadata,
          }
        : null;

      return (
        <MockPurchaseProvider
          purchaseItems={args.mockPurchaseItems || []}
          availableTokens={args.mockAvailableTokens || []}
          convertedPrice={convertedPrice}
        >
          <div className="w-[408px] max-w-md mx-auto">
            <Story />
          </div>
        </MockPurchaseProvider>
      );
    },
  ],
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// USDC payment example with referral
export const USDCPayment: Story = {
  args: {
    quote: {
      basePrice: BigInt(100000000), // $100 USDC (6 decimals)
      protocolFee: BigInt(2500000), // $2.50 protocol fee
      referralFee: BigInt(5000000), // $5 USDC referral fee
      totalCost: BigInt(107500000), // $107.50 total
      paymentToken: USDC_ADDRESS,
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
    mockPurchaseItems: [
      {
        title: "Adventurer #8",
        subtitle: "Adventurers",
        icon: TOKEN_ICONS.LORDS,
        value: 50.0,
        type: ItemType.NFT,
      },
      {
        title: "Adventurer #12",
        subtitle: "Adventurers",
        icon: TOKEN_ICONS.LORDS,
        value: 50.0,
        type: ItemType.NFT,
      },
    ],
    mockAvailableTokens: [
      {
        name: "USD Coin",
        address: USDC_ADDRESS,
        symbol: "USDC",
        decimals: 6,
        icon: TOKEN_ICONS.USDC,
      },
    ],
    mockConvertedPrice: {
      amount: "107500000", // $107.50 equivalent (string to avoid BigInt serialization)
      tokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
  },
};

// ETH payment example (18 decimals)
export const ETHPayment: Story = {
  args: {
    quote: {
      basePrice: BigInt(50000000000000000), // 0.05 ETH
      protocolFee: BigInt(1250000000000000), // 0.00125 ETH
      referralFee: BigInt(2500000000000000), // 0.0025 ETH
      totalCost: BigInt(53750000000000000), // 0.05375 ETH
      paymentToken:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH on Starknet
      paymentTokenMetadata: {
        symbol: "ETH",
        decimals: 18,
      },
    },
    mockPurchaseItems: [
      {
        title: "Realms World Pack",
        subtitle: "Premium Bundle",
        icon: TOKEN_ICONS.LORDS,
        value: 100.0,
        type: ItemType.NFT,
      },
    ],
    mockAvailableTokens: [
      {
        name: "Ethereum",
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        symbol: "ETH",
        decimals: 18,
        icon: TOKEN_ICONS.ETH,
      },
    ],
    mockConvertedPrice: {
      amount: "134375000000000000", // $134.375 equivalent in wei (string to avoid BigInt serialization)
      tokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
  },
};

// No referral fee (tooltip still shows, just hides referral line)
export const NoReferral: Story = {
  args: {
    quote: {
      basePrice: BigInt(50000000), // $50 USDC
      protocolFee: BigInt(1250000), // $1.25 protocol fee
      referralFee: BigInt(0), // No referral
      totalCost: BigInt(51250000), // $51.25 total
      paymentToken: USDC_ADDRESS,
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
    mockPurchaseItems: [
      {
        title: "Starter Credits",
        subtitle: "Game Currency",
        icon: TOKEN_ICONS.CREDITS,
        value: 50.0,
        type: ItemType.CREDIT,
      },
    ],
    mockAvailableTokens: [
      {
        name: "USD Coin",
        address: USDC_ADDRESS,
        symbol: "USDC",
        decimals: 6,
        icon: TOKEN_ICONS.USDC,
      },
    ],
  },
};

// With tooltip open
export const WithTooltipOpen: Story = {
  args: {
    quote: {
      basePrice: BigInt(25000000), // $25 USDC
      protocolFee: BigInt(625000), // $0.625 protocol fee
      referralFee: BigInt(1250000), // $1.25 referral
      totalCost: BigInt(26875000), // $26.875 total
      paymentToken: USDC_ADDRESS,
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
    openFeesTooltip: true,
    mockPurchaseItems: [
      {
        title: "Epic Sword",
        subtitle: "Legendary Weapon",
        icon: TOKEN_ICONS.ETH,
        value: 15.0,
        type: ItemType.NFT,
      },
      {
        title: "Health Potion x5",
        subtitle: "Consumables",
        icon: TOKEN_ICONS.STRK,
        value: 10.0,
        type: ItemType.ERC20,
      },
    ],
    mockAvailableTokens: [
      {
        name: "USD Coin",
        address: USDC_ADDRESS,
        symbol: "USDC",
        decimals: 6,
        icon: TOKEN_ICONS.USDC,
      },
    ],
    mockConvertedPrice: {
      amount: "26875000", // $26.875 equivalent (string to avoid BigInt serialization)
      tokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
  },
};
