import type { Meta, StoryObj } from "@storybook/react";
import { OnchainStarterPackInner } from "./starterpack";
import { ItemType, StarterpackProviders } from "@/context";

const meta = {
  component: OnchainStarterPackInner,
  argTypes: {
    quote: {
      control: false, // Disable controls for BigInt serialization
    },
  },
  decorators: [
    (Story) => (
      <StarterpackProviders>
        <Story />
      </StarterpackProviders>
    ),
  ],
} satisfies Meta<typeof OnchainStarterPackInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Starterpack",
    description: "A unique starter NFT for your collection",
    icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
    quote: {
      basePrice: 5000000n,
      referralFee: 0n,
      protocolFee: 10000n,
      totalCost: 5100000n,
      paymentToken:
        "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
      paymentTokenMetadata: {
        symbol: "STRK",
        decimals: 6,
      },
      convertedPrice: {
        amount: 1000000n,
        token:
          "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8",
        tokenMetadata: {
          symbol: "USDC",
          decimals: 6,
        },
        priceImpact: 0,
      },
    },
    items: [
      {
        title: "Starter NFT",
        subtitle: "A unique starter NFT for your collection",
        icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: ItemType.NFT,
      },
    ],
  },
};

// export const StarterPackWithNoSupply: Story = {
//   args: {
//     name: "Starterpack",
//     supply: 0,
//     isVerified: false,
//     starterpackItems: [
//       {
//         title: "Starter NFT",
//         subtitle: "A unique starter NFT for your collection",
//         icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
//         type: ItemType.NFT,
//       },
//     ],
//   },
// };

// export const StarterPackWithCollections: Story = {
//   args: {
//     name: "Starterpack",
//     starterpackItems: [
//       {
//         title: "Starter NFT",
//         subtitle: "A unique starter NFT for your collection",
//         icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
//         type: ItemType.NFT,
//       },
//     ],
//   },
// };

// export const StarterPackWithVerifiedEdition: Story = {
//   args: {
//     name: "Starterpack",
//     edition: "Season 0: Genesis",
//     isVerified: true,
//     starterpackItems: [
//       {
//         title: "Starter NFT",
//         subtitle: "A unique starter NFT for your collection",
//         icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
//         type: ItemType.NFT,
//       },
//     ],
//   },
// };

// export const StarterPackWithUnverifiedEdition: Story = {
//   args: {
//     name: "Starterpack",
//     edition: "Season 0: Genesis",
//     isVerified: false,
//     starterpackItems: [
//       {
//         title: "Starter NFT",
//         subtitle: "A unique starter NFT for your collection",
//         icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
//         type: ItemType.NFT,
//       },
//     ],
//   },
// };
