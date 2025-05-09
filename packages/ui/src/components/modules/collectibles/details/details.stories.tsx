import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleDetails } from "./details";
import { constants } from "starknet";

const meta: Meta<typeof CollectibleDetails> = {
  title: "Modules/Collectibles/Details",
  component: CollectibleDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Details",
    address: "0x1234567890123456789012345678901234567890",
    tokenId: "0x0000000000008",
    standard: "ERC721",
    chainId: constants.StarknetChainId.SN_MAIN,
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleDetails>;

export const Default: Story = {};

export const Owner: Story = {
  args: {
    owner: "bal7hazar",
  },
};
