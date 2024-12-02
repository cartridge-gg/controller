import type { Meta, StoryObj } from "@storybook/react";
import { LoginMode } from "./types";
import { CreateController } from "./CreateController";
import { ControllerThemeProvider } from "hooks/theme";
import { defaultPresets, ControllerTheme } from "@cartridge/controller";
import { ChakraProvider } from "@chakra-ui/react";
import { useChakraTheme } from "hooks/theme";

const meta: Meta<typeof CreateController> = {
  component: CreateController,
  parameters: {
    controls: { expanded: true },
    argTypes: {
      preset: {
        description: "Theme preset",
        options: Object.keys(defaultPresets),
        control: { type: "select" },
        table: { category: "Theme" },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const presetId = context.parameters.preset || "cartridge";
      const preset = defaultPresets[presetId];
      const chakraTheme = useChakraTheme(preset);
      const ctrlTheme: ControllerTheme = {
        id: preset.id,
        name: preset.name,
        icon: preset.icon,
        cover: preset.cover,
        colorMode: "dark",
      };

      return (
        <ChakraProvider theme={chakraTheme}>
          <ControllerThemeProvider theme={preset} value={ctrlTheme}>
            <Story />
          </ControllerThemeProvider>
        </ChakraProvider>
      );
    },
  ],
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
