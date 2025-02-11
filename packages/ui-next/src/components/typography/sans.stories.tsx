import { cn } from "@/utils";
import type { Meta, StoryObj } from "@storybook/react";

const P = ({ label, className }: { label: string; className: string }) => {
  return <p className={cn("font-sans", className)}>{label}</p>;
};

const meta: Meta<typeof P> = {
  title: "Typography/Sans",
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

export const Regular10px: Story = {
  args: {
    className: "text-[10px]/[12px]",
  },
};

export const Regular12px: Story = {
  args: {
    className: "text-xs",
  },
};

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

export const Medium12px: Story = {
  args: {
    className: "text-xs font-medium",
  },
};

export const Medium14px: Story = {
  args: {
    className: "text-sm font-medium",
  },
};

export const SemiBold12px: Story = {
  args: {
    className: "text-xs font-semibold",
  },
};

export const SemiBold14px: Story = {
  args: {
    className: "text-sm font-semibold",
  },
};

export const SemiBold18px: Story = {
  args: {
    className: "text-lg font-semibold",
  },
};

export const Bold14px: Story = {
  args: {
    className: "text-sm font-bold",
  },
};

export const Bold18px: Story = {
  args: {
    className: "text-lg font-bold",
  },
};
