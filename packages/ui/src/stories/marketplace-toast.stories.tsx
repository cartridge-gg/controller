import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceToast } from "@/components/primitives/toast/specialized-toasts";

const meta: Meta<typeof MarketplaceToast> = {
  title: "Primitives/Toast/Marketplace Toast",
  component: MarketplaceToast,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  argTypes: {
    title: { control: "text" },
    collectionName: { control: "text" },
    itemNames: { array: "text" },
    itemImages: { array: "text" },
    color: { control: "color" },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof MarketplaceToast>;

export const PurchasedBeast: Story = {
  args: {
    title: "Purchased",
    collectionName: "Beasts",
    itemNames: ["Beast #111"],
    itemImages: [
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
    ],
    preset: "loot-survivor",
  },
};

export const PurchasedBeasts: Story = {
  args: {
    title: "Purchased",
    collectionName: "Beasts",
    itemNames: ["Beast #111", "Beast #222", "Beast #333"],
    itemImages: [
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
    ],
    preset: "loot-survivor",
  },
};

export const SentBeast: Story = {
  args: {
    title: "Sent",
    collectionName: "Beasts",
    itemNames: ["Beast #111"],
    itemImages: [
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
    ],
    preset: "loot-survivor",
  },
};

export const SentBeasts: Story = {
  args: {
    title: "Sent",
    collectionName: "Beasts",
    itemNames: ["Beast #111", "Beast #222", "Beast #333"],
    itemImages: [
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
    ],
    preset: "loot-survivor",
  },
};

export const SoldJoker: Story = {
  args: {
    title: "Sold",
    collectionName: "Jokers of Neon: Cards",
    itemNames: ["Jack of Diamonds #222"],
    itemImages: [
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x04ddbbab7aa237c1b73c931b6f836ded6036f5e12d4898fccdcde81d494f7956/0x0000000000000000000000000000000000000000000000000000000000000953/image?width=300&height=300",
    ],
    preset: "jokers-of-neon",
  },
};

export const PurchasedStarterPack: Story = {
  args: {
    title: "Purchased",
    collectionName: "Eternum Season Pass",
    itemNames: ["Eternum Season Pass"],
    itemImages: ["https://static.cartridge.gg/presets/eternum/icon.svg"],
  },
};

export const SentLords: Story = {
  args: {
    title: "Sent",
    collectionName: "LORDS",
    itemNames: ["500 LORDS"],
    itemImages: [
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    ],
  },
};
