import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { CreateAccount } from "./create";

const meta: Meta<typeof CreateAccount> = {
  title: "Modules/CreateAccount",
  component: CreateAccount,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    usernameField: {
      value: "",
      error: undefined,
    },
    validation: {
      status: "idle",
      error: undefined,
      exists: undefined,
    },
    error: undefined,
    isLoading: false,
    onUsernameChange: fn(),
    onUsernameFocus: fn(),
    onUsernameClear: fn(),
    onKeyDown: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CreateAccount>;

export const Default: Story = {};

export const DefaultValidating: Story = {
  args: {
    usernameField: {
      value: "shinobi",
    },
    validation: {
      status: "validating",
    },
  },
};

export const DefaultLogin: Story = {
  args: {
    usernameField: {
      value: "shinobi",
      error: undefined,
    },
    validation: {
      status: "valid",
      error: undefined,
      exists: true,
    },
  },
};

export const DefaultNew: Story = {
  args: {
    usernameField: {
      value: "shinobi5",
      error: undefined,
    },
    validation: {
      status: "valid",
      error: undefined,
      exists: false,
    },
  },
};

export const ErrorTooShort: Story = {
  args: {
    usernameField: {
      value: "sh",
      error: undefined,
    },
    validation: {
      status: "invalid",
      error: {
        name: "Error",
        message: "Username must be at least 3 characters",
      },
      exists: false,
    },
    error: { name: "Error", message: "Username must be at least 3 characters" },
  },
};

export const ErrorSpecialCharacter: Story = {
  args: {
    usernameField: {
      value: "shin_obi",
      error: undefined,
    },
    validation: {
      status: "invalid",
      exists: false,
    },
    error: {
      name: "Error",
      message: "Username can only contain letters, numbers, and hyphens",
    },
  },
};

export const ErrorTimeout: Story = {
  args: {
    usernameField: {
      value: "",
      error: undefined,
    },
    validation: {
      status: "invalid",
      error: undefined,
      exists: false,
    },
    error: {
      name: "Error",
      message: "The operation either timed out or was not allowed",
    },
  },
};
