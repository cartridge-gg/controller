import { Badge } from "@/components/primitives/badge";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Badge> = {
  title: "Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "approved",
  },
};

export const Secondary: Story = {
  args: {
    children: "approved",
    variant: "secondary",
  },
};

export const Tab: Story = {
  args: {
    children: "100",
    className: "rounded-full",
  },
};
