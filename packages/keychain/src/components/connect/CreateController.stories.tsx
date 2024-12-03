import type { Meta, StoryObj } from "@storybook/react";
import { LoginMode } from "./types";
import { CreateController } from "./CreateController";

const meta: Meta<typeof CreateController> = {
  component: CreateController,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isSlot: false,
    loginMode: LoginMode.Webauthn,
    onCreated: () => {},
  },
};

export const WithTheme: Story = {
  parameters: {
    preset: "loot-survivor",
  },
  args: {
    isSlot: false,
    loginMode: LoginMode.Webauthn,
    onCreated: () => {},
  },
};

export const WithTimeoutError: Story = {
  args: {
    isSlot: false,
    loginMode: LoginMode.Webauthn,
    onCreated: () => {},
    error: new Error("The operation either timed out or was not allowed"),
  },
};

export const WithGenericError: Story = {
  args: {
    isSlot: false,
    loginMode: LoginMode.Webauthn,
    onCreated: () => {},
    error: new Error("Something went wrong"),
  },
};
