import type { Meta, StoryObj } from "@storybook/react";
import { ThumbnailWallet } from "./wallet";

const meta: Meta<typeof ThumbnailWallet> = {
  title: "Modules/Thumbnails/Wallet",
  component: ThumbnailWallet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ThumbnailWallet>;

export const Default: Story = {};

export const ArgentX: Story = {
  args: {
    brand: "argentx",
  },
};

export const Braavos: Story = {
  args: {
    brand: "braavos",
  },
};

export const OpenZeppelin: Story = {
  args: {
    brand: "openzeppelin",
  },
};

export const Controller: Story = {
  args: {
    brand: "controller",
  },
};
