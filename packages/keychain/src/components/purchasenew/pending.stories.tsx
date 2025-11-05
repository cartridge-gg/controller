import type { Meta, StoryObj } from "@storybook/react";
import { PurchasePendingInner } from "./pending";
import { CreditIcon } from "@cartridge/ui";
import {
  ItemType,
  PurchaseContext,
  PurchaseContextType,
} from "@/context/purchase";

const MockPurchaseProvider = ({ children }: { children: React.ReactNode }) => {
  const mockContext: PurchaseContextType = {
    usdAmount: 0,
    purchaseItems: [],
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
    availableTokens: [],
    convertedPrice: null,
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

const meta = {
  component: PurchasePendingInner,
  decorators: [
    (Story) => (
      <MockPurchaseProvider>
        <Story />
      </MockPurchaseProvider>
    ),
  ],
} satisfies Meta<typeof PurchasePendingInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Credits: Story = {
  args: {
    name: "Village Kit",
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 1000,
        type: ItemType.CREDIT,
      },
    ],
  },
};

export const NFT: Story = {
  args: {
    name: "Village Kit",
    items: [
      {
        title: "Village pass",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};
