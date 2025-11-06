import type { Meta, StoryObj } from "@storybook/react";
import {
  PurchasePendingInner,
  OnchainPurchasePendingInner,
  ClaimPendingInner,
} from "./pending";
import { CreditIcon } from "@cartridge/ui";
import {
  ItemType,
  PurchaseContext,
  PurchaseContextType,
} from "@/context/purchase";
import { ReactNode } from "react";
import { ExternalWalletType } from "@cartridge/controller";

const MockPurchaseProvider = ({ children }: { children: ReactNode }) => {
  const mockContext: PurchaseContextType = {
    usdAmount: 100,
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

// Main component meta
const meta = {
  decorators: [
    (Story) => (
      <MockPurchaseProvider>
        <div className="w-full max-w-md mx-auto">
          <Story />
        </div>
      </MockPurchaseProvider>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Stories for PurchasePendingInner (Crypto payments)
export const CryptoPurchaseWithCredits: Story = {
  render: () => (
    <PurchasePendingInner
      name="Village Kit"
      items={[
        {
          title: "Credits",
          icon: <CreditIcon />,
          value: 1000,
          type: ItemType.CREDIT,
        },
        {
          title: "STRK",
          subtitle: "Starknet Token",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
          value: 100,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      paymentId="payment_123"
      transactionHash="0x1234567890abcdef"
      explorer={{
        name: "Etherscan",
        url: "https://etherscan.io/tx/0x1234567890abcdef",
      }}
      wallet={{
        type: "metamask" as ExternalWalletType,
        available: true,
        name: "MetaMask",
        platform: "ethereum",
        connectedAccounts: ["0x1234...5678"],
      }}
    />
  ),
};

export const CryptoPurchaseWithNFT: Story = {
  render: () => (
    <PurchasePendingInner
      name="Adventure Pack"
      items={[
        {
          title: "Legendary Sword",
          icon: "https://r2.quddus.my/Frame%203231.png",
          type: ItemType.NFT,
        },
        {
          title: "Credits",
          icon: <CreditIcon />,
          value: 500,
          type: ItemType.CREDIT,
        },
        {
          title: "ETH",
          subtitle: "0.25 Ethereum",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
          value: 0.25,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      paymentId="payment_456"
      transactionHash="0xabcdef1234567890"
      explorer={{
        name: "Etherscan",
        url: "https://etherscan.io/tx/0xabcdef1234567890",
      }}
      wallet={{
        type: "phantom" as ExternalWalletType,
        available: true,
        name: "Phantom",
        platform: "solana",
        connectedAccounts: ["8x9y...1234"],
      }}
    />
  ),
};

export const CryptoPurchaseWithoutWallet: Story = {
  render: () => (
    <PurchasePendingInner
      name="Starter Pack"
      items={[
        {
          title: "Welcome Credits",
          icon: <CreditIcon />,
          value: 250,
          type: ItemType.CREDIT,
        },
        {
          title: "STRK",
          subtitle: "50 Starknet tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
          value: 50,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      paymentId="payment_789"
    />
  ),
};

export const StripePurchase: Story = {
  render: () => (
    <PurchasePendingInner
      name="Premium Pack"
      items={[
        {
          title: "Premium Credits",
          icon: <CreditIcon />,
          value: 2000,
          type: ItemType.CREDIT,
        },
        {
          title: "Rare Artifact",
          icon: "https://r2.quddus.my/Frame%203231.png",
          type: ItemType.NFT,
        },
        {
          title: "USDC",
          subtitle: "500 USDC tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
          value: 500,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="stripe"
      paymentId="pi_stripe123"
    />
  ),
};

// Stories for OnchainPurchasePendingInner
export const OnchainPurchaseWithCredits: Story = {
  render: () => (
    <OnchainPurchasePendingInner
      name="Onchain Pack"
      items={[
        {
          title: "Onchain Credits",
          icon: <CreditIcon />,
          value: 1500,
          type: ItemType.CREDIT,
        },
        {
          title: "WETH",
          subtitle: "1.5 Wrapped Ethereum",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
          value: 1.5,
          type: ItemType.ERC20,
        },
      ]}
      transactionHash="0x987654321abcdef0"
    />
  ),
};

export const OnchainPurchaseWithMultipleItems: Story = {
  render: () => (
    <OnchainPurchasePendingInner
      name="Mega Pack"
      items={[
        {
          title: "Epic Weapon",
          icon: "https://r2.quddus.my/Frame%203231.png",
          type: ItemType.NFT,
        },
        {
          title: "Battle Credits",
          icon: <CreditIcon />,
          value: 3000,
          type: ItemType.CREDIT,
        },
        {
          title: "Magic Potion",
          icon: "https://r2.quddus.my/Frame%203231.png",
          type: ItemType.NFT,
        },
        {
          title: "USDC",
          subtitle: "750 USDC stablecoin",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
          value: 750,
          type: ItemType.ERC20,
        },
      ]}
      transactionHash="0xfedcba0987654321"
    />
  ),
};

// Stories for ClaimPendingInner
export const ClaimFreeCredits: Story = {
  render: () => (
    <ClaimPendingInner
      name="Free Starter"
      items={[
        {
          title: "Welcome Credits",
          icon: <CreditIcon />,
          value: 100,
          type: ItemType.CREDIT,
        },
        {
          title: "LORDS",
          subtitle: "25 LORDS tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
          value: 25,
          type: ItemType.ERC20,
        },
      ]}
      transactionHash="0x1111222233334444"
    />
  ),
};

export const ClaimFreeNFT: Story = {
  render: () => (
    <ClaimPendingInner
      name="Airdrop Pack"
      items={[
        {
          title: "Commemorative Badge",
          icon: "https://r2.quddus.my/Frame%203231.png",
          type: ItemType.NFT,
        },
        {
          title: "Bonus Credits",
          icon: <CreditIcon />,
          value: 50,
          type: ItemType.CREDIT,
        },
        {
          title: "STRK",
          subtitle: "10 Starknet tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
          value: 10,
          type: ItemType.ERC20,
        },
      ]}
      transactionHash="0x5555666677778888"
    />
  ),
};

// Loading states
export const CryptoPurchaseLoading: Story = {
  render: () => (
    <PurchasePendingInner
      name="Loading Pack"
      items={[
        {
          title: "Loading Credits",
          icon: <CreditIcon />,
          value: 1000,
          type: ItemType.CREDIT,
        },
      ]}
      paymentMethod="crypto"
      paymentId="payment_loading"
      transactionHash="0x0000000000000000"
      explorer={{
        name: "Etherscan",
        url: "https://etherscan.io/tx/0x0000000000000000",
      }}
      wallet={{
        type: "argent" as ExternalWalletType,
        available: true,
        name: "Argent X",
        platform: "starknet",
        connectedAccounts: ["0xargent...1234"],
      }}
    />
  ),
};

// Token-focused stories to showcase pricing
export const TokenPurchaseSmallAmount: Story = {
  render: () => (
    <PurchasePendingInner
      name="Small Token Pack"
      items={[
        {
          title: "USDC",
          subtitle: "10 USDC - Stablecoin",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
          value: 10,
          type: ItemType.ERC20,
        },
        {
          title: "LORDS",
          subtitle: "5 LORDS gaming tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
          value: 5,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      paymentId="payment_small_tokens"
      transactionHash="0xabc123def456"
      explorer={{
        name: "Etherscan",
        url: "https://etherscan.io/tx/0xabc123def456",
      }}
      wallet={{
        type: "metamask" as ExternalWalletType,
        available: true,
        name: "MetaMask",
        platform: "ethereum",
        connectedAccounts: ["0x1234...5678"],
      }}
    />
  ),
};

export const TokenPurchaseLargeAmount: Story = {
  render: () => (
    <PurchasePendingInner
      name="High Value Token Pack"
      items={[
        {
          title: "ETH",
          subtitle: "0.5 Ethereum",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
          value: 0.5,
          type: ItemType.ERC20,
        },
        {
          title: "STRK",
          subtitle: "5,000 Starknet tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
          value: 5000,
          type: ItemType.ERC20,
        },
        {
          title: "USDC",
          subtitle: "1,000 USDC",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
          value: 1000,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      paymentId="payment_large_tokens"
      transactionHash="0xdef789abc012"
      explorer={{
        name: "Etherscan",
        url: "https://etherscan.io/tx/0xdef789abc012",
      }}
      wallet={{
        type: "coinbase" as ExternalWalletType,
        available: true,
        name: "Coinbase Wallet",
        platform: "ethereum",
        connectedAccounts: ["0x9876...5432"],
      }}
    />
  ),
};

export const OnchainTokensWithPrices: Story = {
  render: () => (
    <OnchainPurchasePendingInner
      name="DeFi Token Bundle"
      items={[
        {
          title: "STRK",
          subtitle: "1,000 Starknet tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
          value: 1000,
          type: ItemType.ERC20,
        },
        {
          title: "LORDS",
          subtitle: "500 LORDS gaming tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
          value: 500,
          type: ItemType.ERC20,
        },
        {
          title: "ETH",
          subtitle: "2.5 Ethereum",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
          value: 2.5,
          type: ItemType.ERC20,
        },
      ]}
      transactionHash="0x123abc456def"
    />
  ),
};

export const MixedTokensAndCredits: Story = {
  render: () => (
    <ClaimPendingInner
      name="Mixed Reward Pack"
      items={[
        {
          title: "Bonus Credits",
          icon: <CreditIcon />,
          value: 1000,
          type: ItemType.CREDIT,
        },
        {
          title: "USDC",
          subtitle: "25 USDC tokens",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
          value: 25,
          type: ItemType.ERC20,
        },
        {
          title: "ETH",
          subtitle: "0.1 Ethereum",
          icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
          value: 0.1,
          type: ItemType.ERC20,
        },
        {
          title: "Commemorative NFT",
          icon: "https://r2.quddus.my/Frame%203231.png",
          type: ItemType.NFT,
        },
      ]}
      transactionHash="0x789def012abc"
    />
  ),
};
