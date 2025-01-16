import type { Meta, StoryObj } from "@storybook/react";
import { Consent } from "./consent";

const meta: Meta<typeof Consent> = {
  title: "Slot/Consent",
  component: Consent,
  decorators: [(Story) => <Story />],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
