import type { Meta, StoryObj } from "@storybook/react";
import { CreateControllerView } from "./CreateController";
import { ControllerTheme } from "@cartridge/controller";

const meta: Meta<typeof CreateControllerView> = {
  component: CreateControllerView,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    theme: {
      name: "Cartridge",
    } as ControllerTheme,
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

export const WithLightMode: Story = {
  parameters: {
    colorMode: "light",
  },
  args: {
    theme: {
      name: "Cartridge",
    } as ControllerTheme,
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

export const WithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    theme: {
      name: "Eternum",
    } as ControllerTheme,
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

export const WithTimeoutError: Story = {
  args: {
    theme: {
      name: "Cartridge",
    } as ControllerTheme,
    usernameField: {
      value: "username",
      error: undefined,
    },
    validation: {
      status: "valid",
      exists: false,
    },
    isLoading: false,
    error: new Error("The operation either timed out or was not allowed"),
    onUsernameChange: () => {},
    onUsernameFocus: () => {},
    onUsernameClear: () => {},
    onSubmit: () => {},
  },
};

export const WithGenericError: Story = {
  args: {
    theme: {
      name: "Cartridge",
    } as ControllerTheme,
    usernameField: {
      value: "username",
      error: undefined,
    },
    validation: {
      status: "valid",
      exists: false,
    },
    isLoading: false,
    error: new Error("Something went wrong"),
    onUsernameChange: () => {},
    onUsernameFocus: () => {},
    onUsernameClear: () => {},
    onSubmit: () => {},
  },
};
