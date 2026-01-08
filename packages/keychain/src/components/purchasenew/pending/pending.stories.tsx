import type { Meta, StoryObj } from "@storybook/react";
import { BridgePending, PurchasePending, ClaimPending } from "./index";
import { CreditIcon } from "@cartridge/ui";
import { ItemType, StarterpackProviders } from "@/context";
import { ExternalWalletType } from "@cartridge/controller";

const TOKEN_ICONS = {
  USDC: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
  STRK: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
  ETH: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  LORDS:
    "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
};

// Main component meta
const meta = {
  decorators: [
    (Story) => (
      <StarterpackProviders>
        <div className="w-full max-w-md mx-auto">
          <Story />
        </div>
      </StarterpackProviders>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Stories for BridgePending (Crypto bridging payments)
export const CryptoPurchaseWithCredits: Story = {
  render: () => (
    <BridgePending
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
          icon: TOKEN_ICONS.STRK,
          value: 100,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      swapId="payment_123"
      transactionHash="0x1234567890abcdef"
      selectedPlatform="ethereum"
      waitForDeposit={async () => true}
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
    <BridgePending
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
          icon: TOKEN_ICONS.ETH,
          value: 0.25,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      swapId="payment_456"
      transactionHash="0xabcdef1234567890"
      selectedPlatform="solana"
      waitForDeposit={async () => true}
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
    <BridgePending
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
          icon: TOKEN_ICONS.STRK,
          value: 50,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      swapId="payment_789"
      selectedPlatform="starknet"
      waitForDeposit={async () => true}
    />
  ),
};

export const StripePurchase: Story = {
  render: () => (
    <BridgePending
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
          icon: TOKEN_ICONS.USDC,
          value: 500,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="stripe"
      swapId="pi_stripe123"
      selectedPlatform="starknet"
      waitForDeposit={async () => true}
    />
  ),
};

// Stories for PurchasePending (Onchain Starknet purchases)
export const OnchainPurchaseWithCredits: Story = {
  render: () => (
    <PurchasePending
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
          icon: TOKEN_ICONS.ETH,
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
    <PurchasePending
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
          icon: TOKEN_ICONS.USDC,
          value: 750,
          type: ItemType.ERC20,
        },
      ]}
      transactionHash="0xfedcba0987654321"
    />
  ),
};

// Stories for ClaimPending
export const ClaimFreeCredits: Story = {
  render: () => (
    <ClaimPending
      quantity={1}
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
          icon: TOKEN_ICONS.LORDS,
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
    <ClaimPending
      name="Airdrop Pack"
      quantity={1}
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
          icon: TOKEN_ICONS.STRK,
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
    <BridgePending
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
      swapId="payment_loading"
      transactionHash="0x0000000000000000"
      selectedPlatform="starknet"
      waitForDeposit={async () => true}
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
    <BridgePending
      name="Small Token Pack"
      items={[
        {
          title: "USDC",
          subtitle: "10 USDC - Stablecoin",
          icon: TOKEN_ICONS.USDC,
          value: 10,
          type: ItemType.ERC20,
        },
        {
          title: "LORDS",
          subtitle: "5 LORDS gaming tokens",
          icon: TOKEN_ICONS.LORDS,
          value: 5,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      swapId="payment_small_tokens"
      transactionHash="0xabc123def456"
      selectedPlatform="ethereum"
      waitForDeposit={async () => true}
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
    <BridgePending
      name="High Value Token Pack"
      items={[
        {
          title: "ETH",
          subtitle: "0.5 Ethereum",
          icon: TOKEN_ICONS.ETH,
          value: 0.5,
          type: ItemType.ERC20,
        },
        {
          title: "STRK",
          subtitle: "5,000 Starknet tokens",
          icon: TOKEN_ICONS.STRK,
          value: 5000,
          type: ItemType.ERC20,
        },
        {
          title: "USDC",
          subtitle: "1,000 USDC",
          icon: TOKEN_ICONS.USDC,
          value: 1000,
          type: ItemType.ERC20,
        },
      ]}
      paymentMethod="crypto"
      swapId="payment_large_tokens"
      transactionHash="0xdef789abc012"
      selectedPlatform="ethereum"
      waitForDeposit={async () => true}
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
    <PurchasePending
      name="DeFi Token Bundle"
      items={[
        {
          title: "STRK",
          subtitle: "1,000 Starknet tokens",
          icon: TOKEN_ICONS.STRK,
          value: 1000,
          type: ItemType.ERC20,
        },
        {
          title: "LORDS",
          subtitle: "500 LORDS gaming tokens",
          icon: TOKEN_ICONS.LORDS,
          value: 500,
          type: ItemType.ERC20,
        },
        {
          title: "ETH",
          subtitle: "2.5 Ethereum",
          icon: TOKEN_ICONS.ETH,
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
    <ClaimPending
      name="Mixed Reward Pack"
      quantity={1}
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
          icon: TOKEN_ICONS.USDC,
          value: 25,
          type: ItemType.ERC20,
        },
        {
          title: "ETH",
          subtitle: "0.1 Ethereum",
          icon: TOKEN_ICONS.ETH,
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
