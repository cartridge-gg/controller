import type { Meta, StoryObj } from "@storybook/react";
import { StarterPackInner } from "./starterpack";
import { NavigationProvider } from "@/context";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";
import { StarterPackItemType } from "@cartridge/controller";

const meta = {
  component: StarterPackInner,
  argTypes: {
    starterpackItems: {
      control: false, // Disable controls for BigInt serialization
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider>
        <Story />
      </NavigationProvider>
    ),
  ],
} satisfies Meta<typeof StarterPackInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Starterpack",
    acquisitionType: StarterpackAcquisitionType.Paid,
    starterpackItems: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        iconURL:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterPackItemType.NONFUNGIBLE,
        price: 5000000n,
      },
    ],
  },
};

export const StarterPackWithNoSupply: Story = {
  args: {
    name: "Starterpack",
    supply: 0,
    acquisitionType: StarterpackAcquisitionType.Paid,
    isVerified: false,
    starterpackItems: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        iconURL:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterPackItemType.NONFUNGIBLE,
        price: 5000000n,
      },
    ],
  },
};

export const StarterPackWithCollections: Story = {
  args: {
    name: "Starterpack",
    acquisitionType: StarterpackAcquisitionType.Claimed,
    starterpackItems: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        iconURL:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterPackItemType.NONFUNGIBLE,
      },
    ],
  },
};

export const StarterPackWithVerifiedEdition: Story = {
  args: {
    name: "Starterpack",
    acquisitionType: StarterpackAcquisitionType.Claimed,
    edition: "Season 0: Genesis",
    isVerified: true,
    starterpackItems: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        iconURL:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterPackItemType.NONFUNGIBLE,
      },
    ],
  },
};

export const StarterPackWithUnverifiedEdition: Story = {
  args: {
    name: "Starterpack",
    acquisitionType: StarterpackAcquisitionType.Claimed,
    edition: "Season 0: Genesis",
    isVerified: false,
    starterpackItems: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        iconURL:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterPackItemType.NONFUNGIBLE,
      },
    ],
  },
};

