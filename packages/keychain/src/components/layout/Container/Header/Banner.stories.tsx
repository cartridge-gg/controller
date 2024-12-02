import type { Meta, StoryObj } from "@storybook/react";
import { Banner } from "./Banner";
import { LayoutContext } from "..";

const meta: Meta<typeof Banner> = {
  component: Banner,
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#161a17" }],
    },
  },
  decorators: [
    (Story, context) => (
      <LayoutContext.Provider
        value={{
          variant: context.parameters.variant || "default",
          footer: {
            height: 0,
            setHeight: () => {},
            isOpen: false,
            onToggle: () => {},
          },
        }}
      >
        <Story />
      </LayoutContext.Provider>
    ),
  ],
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
