import type { Meta, StoryObj } from "@storybook/react";
import { StarterPackInner } from "./starterpack";
import { StarterItemType } from "@/hooks/starterpack";
import { NavigationProvider } from "@/context";

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
