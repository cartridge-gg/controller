import type { Meta, StoryObj } from "@storybook/react";

import { SessionConsent } from "./SessionConsent";

const meta = {
  // tags: ["autodocs"],
  component: SessionConsent,
  parameters: {
    connection: {
      origin: "https://cartridge.gg",
    },
  },
  args: {
    isVerified: true,
  },
} satisfies Meta<typeof SessionConsent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slot: Story = {
  args: {
    variant: "slot",
  },
};

export const Signup: Story = {
  args: {
    variant: "signup",
  },
};
