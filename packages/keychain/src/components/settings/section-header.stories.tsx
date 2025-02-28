import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "./section-header";

const meta = {
  title: "components/settings/Section Header",
  component: SectionHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Session Key(s)",
    description:
      "Sessions grant permission to your Controller to perform certain game actions on your behalf",
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
