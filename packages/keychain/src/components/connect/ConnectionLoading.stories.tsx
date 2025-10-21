import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionLoading } from "./ConnectionLoading";

const meta: Meta<typeof ConnectionLoading> = {
  component: ConnectionLoading,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionLoading>;

export const Default: Story = {};

export const WithPasskey: Story = {
  args: {
    authMethod: "webauthn",
  },
};

export const WithGoogle: Story = {
  args: {
    authMethod: "google",
  },
};

export const WithDiscord: Story = {
  args: {
    authMethod: "discord",
  },
};

export const WithWalletConnect: Story = {
  args: {
    authMethod: "walletconnect",
  },
};

export const WithMetaMask: Story = {
  args: {
    authMethod: "metamask",
  },
};

export const WithPassword: Story = {
  args: {
    authMethod: "password",
  },
};

export const WithBraavos: Story = {
  args: {
    authMethod: "braavos",
  },
};
