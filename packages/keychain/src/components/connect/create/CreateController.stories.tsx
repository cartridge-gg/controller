import type { Meta, StoryObj } from "@storybook/react";
import { CreateControllerView } from "./CreateController";
import { VerifiableControllerTheme } from "@/context/theme";

const meta: Meta<typeof CreateControllerView> = {
  tags: ["autodocs"],
  component: CreateControllerView,
  parameters: {
    controls: { expanded: true },
  },
  args: {
    variant: "next",
    theme: {
      name: "Cartridge",
      verified: true,
    } as VerifiableControllerTheme,
    usernameField: {
      value: "",
      error: undefined,
    },
    validation: {
      status: "valid",
      exists: false,
    },
    isLoading: false,
    onUsernameChange: () => {},
    onUsernameFocus: () => {},
    onUsernameClear: () => {},
    onSubmit: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const LegacyDefault: Story = {
  args: {
    variant: "legacy",
  },
};

export const Default: Story = {};

export const LegacyWithLightMode: Story = {
  parameters: {
    colorMode: "light",
  },
  args: {
    variant: "legacy",
  },
};

export const WithLightMode: Story = {
  parameters: {
    colorMode: "light",
  },
};

export const LegacyWithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    theme: {
      name: "Eternum",
    } as VerifiableControllerTheme,
    variant: "legacy",
  },
};

export const WithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    theme: {
      name: "Eternum",
    } as VerifiableControllerTheme,
  },
};

export const LegacyWithTimeoutError: Story = {
  args: {
    usernameField: {
      value: "username",
    },
    error: new Error("The operation either timed out or was not allowed"),
    variant: "legacy",
  },
};

export const WithTimeoutError: Story = {
  args: {
    usernameField: {
      value: "username",
    },
    error: new Error("The operation either timed out or was not allowed"),
  },
};

export const LegacyWithValidationError: Story = {
  args: {
    usernameField: {
      value: "@#$!",
    },
    validation: {
      status: "invalid",
      exists: false,
    },
    error: new Error("Username can only contain letters, numbers, and hyphens"),
    variant: "legacy",
  },
};

export const WithValidationError: Story = {
  args: {
    usernameField: {
      value: "@#$!",
    },
    validation: {
      status: "invalid",
      exists: false,
    },
    error: new Error("Username can only contain letters, numbers, and hyphens"),
  },
};

export const LegacyWithGenericError: Story = {
  args: {
    usernameField: {
      value: "username",
    },
    error: new Error("Something went wrong"),
    variant: "legacy",
  },
};

export const WithGenericError: Story = {
  args: {
    usernameField: {
      value: "username",
    },
    error: new Error("Something went wrong"),
  },
};
