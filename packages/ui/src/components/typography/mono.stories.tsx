import { cn } from "@/utils";
import type { Meta, StoryObj } from "@storybook/react";

const P = ({ label, className }: { label: string; className: string }) => {
  return <p className={cn("font-mono", className)}>{label}</p>;
};

const meta: Meta<typeof P> = {
  title: "Typography/Mono",
  component: P,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    label: "The quick brown fox jumps over the lazy dog.",
    className: "",
  },
};

export default meta;

type Story = StoryObj<typeof P>;

export const Regular14px: Story = {
  args: {
    className: "text-sm",
  },
};

export const Regular16px: Story = {
  args: {
    className: "text-base",
  },
};

export const Medium16px: Story = {
  args: {
    className: "text-base font-medium",
  },
};

export const SemiBold16px: Story = {
  args: {
    className: "text-base font-semibold",
  },
};
