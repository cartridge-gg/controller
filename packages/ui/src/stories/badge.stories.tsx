import { Badge } from "@/components/primitives/badge";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
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

export const Primary: Story = {
  args: {
    children: "approved",
    variant: "primary",
  },
};

export const Muted: Story = {
  args: {
    children: "approved",
    variant: "muted",
  },
};

export const Tab: Story = {
  args: {
    children: "100",
    className: "rounded-full",
    variant: "primary",
  },
};
