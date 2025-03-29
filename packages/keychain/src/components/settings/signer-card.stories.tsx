import type { Meta, StoryObj } from "@storybook/react";
import { SignerCard } from "./signer-card";
import { SignerType } from "@cartridge/utils/api/cartridge";

const meta = {
  title: "components/settings/Signer Card",
  component: SignerCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    signerType: SignerType.Starknet,
  },
} satisfies Meta<typeof SignerCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
