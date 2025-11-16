import type { Meta, StoryObj } from "@storybook/react";
import { CostBreakdown } from "./cost";
import { PurchaseContext } from "@/context/purchase";
import { ItemType, type Item } from "@/context";
import type { PurchaseContextType } from "@/context";
import { TOKEN_ICONS } from "@/constants";

// Mock context with purchase items
const MockPurchaseProvider = ({
  children,
  purchaseItems = [],
  layerswapFees,
}: {
  children: React.ReactNode;
  purchaseItems?: Item[];
  layerswapFees?: string;
}) => {
  const mockContext: PurchaseContextType = {
    usdAmount: 100,
    purchaseItems,
    claimItems: [],
    layerswapFees,
    isFetchingFees: false,
    selectedPlatform: "ethereum",
    stripePromise: Promise.resolve(null),
    isStripeLoading: false,
    isDepositLoading: false,
    isStarterpackLoading: false,
    clearError: () => {},
    clearSelectedWallet: () => {},
    availableTokens: [],
    convertedPrice: null,
    swapQuote: null,
    isFetchingConversion: false,
    conversionError: null,
    setUsdAmount: () => {},
    setDepositAmount: () => {},
    setStarterpackId: () => {},
    setClaimItems: () => {},
    setTransactionHash: () => {},
    setSelectedToken: () => {},
    onCreditCardPurchase: async () => {},
    onBackendCryptoPurchase: async () => {},
    onOnchainPurchase: async () => {},
    onExternalConnect: async () => undefined,
    waitForDeposit: async () => true,
    fetchFees: async () => {},
  };

  return (
    <PurchaseContext.Provider value={mockContext}>
      {children}
    </PurchaseContext.Provider>
  );
};

// Extend the component args to include mock data
type StoryArgs = React.ComponentProps<typeof CostBreakdown> & {
  mockPurchaseItems?: Item[];
  mockLayerswapFees?: string;
};

const meta: Meta<StoryArgs> = {
  component: CostBreakdown,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story, { args }) => {
      return (
        <MockPurchaseProvider
          purchaseItems={args.mockPurchaseItems || []}
          layerswapFees={args.mockLayerswapFees}
        >
          <div className="w-[400px]">
            <Story />
          </div>
        </MockPurchaseProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const WithoutFee: Story = {
  args: {
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 0,
      totalInCents: 1000,
    },
    rails: "stripe",
    mockPurchaseItems: [
      {
        title: "Adventurer #8",
        subtitle: "Adventurers",
        icon: TOKEN_ICONS.LORDS,
        value: 5.0,
        type: ItemType.NFT,
      },
      {
        title: "Adventurer #12",
        subtitle: "Adventurers",
        icon: TOKEN_ICONS.LORDS,
        value: 5.0,
        type: ItemType.NFT,
      },
    ],
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
    walletType: "metamask",
    mockPurchaseItems: [
      {
        title: "1000 Credits",
        subtitle: "Game Credits",
        icon: TOKEN_ICONS.CREDITS,
        value: 10.0,
        type: ItemType.CREDIT,
      },
    ],
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
    mockPurchaseItems: [
      {
        title: "Starter Pack #1",
        subtitle: "Loot Survivor",
        icon: TOKEN_ICONS.LORDS,
        value: 8.0,
        type: ItemType.NFT,
      },
      {
        title: "500 Credits",
        subtitle: "Game Credits",
        icon: TOKEN_ICONS.CREDITS,
        value: 2.0,
        type: ItemType.CREDIT,
      },
    ],
  },
};

export const WithLayerswapFee: Story = {
  args: {
    costDetails: {
      baseCostInCents: 2500,
      processingFeeInCents: 62,
      totalInCents: 2562,
    },
    rails: "crypto",
    walletType: "metamask",
    mockPurchaseItems: [
      {
        title: "Premium Pack",
        subtitle: "Realms World",
        icon: TOKEN_ICONS.LORDS,
        value: 15.0,
        type: ItemType.NFT,
      },
      {
        title: "Building Materials",
        subtitle: "Resources",
        icon: TOKEN_ICONS.STRK,
        value: 10.0,
        type: ItemType.ERC20,
      },
    ],
    mockLayerswapFees: "2500000", // $2.50 in wei
  },
};

export const WithTooltipOpen: Story = {
  args: {
    costDetails: {
      baseCostInCents: 1500,
      processingFeeInCents: 134,
      totalInCents: 1634,
    },
    rails: "stripe",
    openFeesTooltip: true,
    mockPurchaseItems: [
      {
        title: "Epic Sword",
        subtitle: "Weapons",
        icon: TOKEN_ICONS.ETH,
        value: 12.0,
        type: ItemType.NFT,
      },
      {
        title: "Magic Potion x3",
        subtitle: "Consumables",
        icon: TOKEN_ICONS.STRK,
        value: 3.0,
        type: ItemType.ERC20,
      },
    ],
  },
};
