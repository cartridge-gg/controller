import type { Meta, StoryObj } from "@storybook/react";
import { EthereumIcon, TransferIcon } from "@cartridge/ui";
import { LayoutHeader } from "./index";

const meta: Meta<typeof LayoutHeader> = {
  title: "Layout/Header",
  component: LayoutHeader,
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#161a17" }],
    },
  },
  args: {
    variant: "compressed",
    title: "Welcome to Keychain",
    description: "Secure your digital assets",
  },
} satisfies Meta<typeof LayoutHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: {
    variant: "expanded",
  },
};

export const Compressed: Story = {};

export const IconComponentProp: Story = {
  args: {
    Icon: TransferIcon,
  },
};

export const IconElementProp: Story = {
  args: {
    icon: <EthereumIcon size="lg" />,
  },
};

export const VeryLongTitle: Story = {
  args: {
    title: "This is a very long title that should be truncated",
    description:
      "This is a very long description that should be wrapped and demonstrate how text behaves when it extends beyond multiple lines. It's important to test how the UI handles lengthy content to ensure proper wrapping, readability, and overall visual appeal. How does this much longer description look in the component?",
  },
};
