import type { Meta, StoryObj } from "@storybook/react";
import { StarterPackInner } from "./starterpack";
import { StarterItemType } from "@/hooks/starterpack";
import { NavigationProvider } from "@/context";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";

const meta = {
  component: StarterPackInner,
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
    supply: 10,
    acquisitionType: StarterpackAcquisitionType.Paid,
    starterpackItems: [
      {
        title: "Starter NFT",
        description: "A unique starter NFT for your collection",
        image:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterItemType.NFT,
        price: 100,
      },
    ],
  },
};

export const StarterPackWithCollections: Story = {
  args: {
    name: "Starterpack",
    supply: 10,
    acquisitionType: StarterpackAcquisitionType.Claimed,
    starterpackItems: [
      {
        title: "Starter NFT",
        description: "A unique starter NFT for your collection",
        image:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterItemType.NFT,
        price: 0,
      },
    ],
  },
};

export const StarterPackWithVerifiedEdition: Story = {
  args: {
    name: "Starterpack",
    supply: 10,
    acquisitionType: StarterpackAcquisitionType.Claimed,
    edition: "Season 0: Genesis",
    isVerified: true,
    starterpackItems: [
      {
        title: "Starter NFT",
        description: "A unique starter NFT for your collection",
        image:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterItemType.NFT,
        price: 0,
      },
    ],
  },
};

export const StarterPackWithUnverifiedEdition: Story = {
  args: {
    name: "Starterpack",
    supply: 10,
    acquisitionType: StarterpackAcquisitionType.Claimed,
    edition: "Season 0: Genesis",
    isVerified: false,
    starterpackItems: [
      {
        title: "Starter NFT",
        description: "A unique starter NFT for your collection",
        image:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: StarterItemType.NFT,
        price: 0,
      },
    ],
  },
};
