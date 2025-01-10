import type { Meta, StoryObj } from "@storybook/react";
import { Banner } from "./Banner";

const meta: Meta<typeof Banner> = {
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#161a17" }],
    },
  },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  parameters: {
    variant: "expanded",
  },
  args: {
    title: "Welcome to Keychain",
    description: "Secure your digital assets",
  },
};

export const Compressed: Story = {
  parameters: {
    variant: "compressed",
  },
  args: {
    title: "Welcome to Keychain",
    description: "Secure your digital assets",
  },
};
