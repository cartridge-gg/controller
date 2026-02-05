import type { Meta, StoryObj } from "@storybook/react";
import { StorageAccessPrompt } from "./StorageAccessPrompt";

const meta = {
  component: StorageAccessPrompt,
  parameters: {
    connection: {
      origin: "https://cartridge.gg",
      theme: {
        name: "Cartridge",
        icon: "/cartridge-icon.svg",
      },
    },
  },
} satisfies Meta<typeof StorageAccessPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    appName: "Cartridge",
    onContinue: () => {},
    isLoading: false,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    appName: "Cartridge",
    onContinue: () => {},
    isLoading: true,
    error: null,
  },
};

export const WithError: Story = {
  args: {
    appName: "Cartridge",
    onContinue: () => {},
    isLoading: false,
    error: "Storage access was not granted. Please try again.",
  },
};
