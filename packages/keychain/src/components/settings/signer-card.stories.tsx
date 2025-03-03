import type { Meta, StoryObj } from "@storybook/react";
import { SignerCard } from "./signer-card";

const meta = {
  title: "components/settings/Signer Card",
  component: SignerCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    deviceName: "This Device",
    deviceType: "mobile",
  },
} satisfies Meta<typeof SignerCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
