import type { Meta, StoryObj } from "@storybook/react";
import { SignerCard } from "./signer-card";

const meta: Meta<typeof SignerCard> = {
  title: "Modules/Settings/Signer Card",
  component: SignerCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof SignerCard>;

export const Default: Story = {
  args: {
    deviceName: "This Device",
    deviceType: "mobile",
  },
};
