import React, { PropsWithChildren } from "react";
import { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import {
  ControllerColor,
  ControllerTheme,
  defaultPresets,
} from "@cartridge/controller";
import {
  ConnectionProvider,
  ConnectionContextValue,
} from "../src/components/Provider/connection";
import { ControllerThemeProvider } from "../src/components/Provider/theme";
import CartridgeTheme from "../../ui/src/theme";
import { ChakraProvider } from "@chakra-ui/react";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    themes: {
      default: "dark",
      list: [
        { name: "dark", class: "dark" },
        { name: "light", class: "light" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <>
        <div>!!!!!!!!!!!!!!!!!!!!!!</div>
        <Provider>
          <Story />
        </Provider>
      </>
    ),
  ],
};

export default preview;

function Provider({ children }: PropsWithChildren) {
  const preset = defaultPresets.cartridge;
  const chakraTheme = {
    ...CartridgeTheme,
    semanticTokens: {
      ...CartridgeTheme.semanticTokens,
      colors: {
        ...CartridgeTheme.semanticTokens.colors,
        brand: {
          ...CartridgeTheme.semanticTokens.colors.brand,
          primary:
            toThemeColor(preset?.colors?.primary) ??
            CartridgeTheme.semanticTokens.colors.brand.primary,
          primaryForeground:
            toThemeColor(preset?.colors?.primaryForeground) ??
            CartridgeTheme.semanticTokens.colors.solid.bg,
        },
      },
    },
  };
  const ctrlTheme: ControllerTheme = {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    cover: preset.cover,
    colorMode: "dark",
  };
  const connection: ConnectionContextValue = {
    context: undefined,
    controller: {},
    origin: "origin",
    rpcUrl: "rpcUrl",
    chainId: "chainId",
    chainName: "chainName",
    policies: [],
    prefunds: [],
    paymaster: undefined,
    hasPrefundRequest: false,
    error: undefined,
    setContext: () => {},
    setController: () => {},
    closeModal: () => {},
    openModal: () => {},
    logout: () => {},
    setDelegate: () => {},
    setDelegateTransaction: () => {},
    setExternalOwnerTransaction: () => {},
    removeExternalOwnerTransaction: () => {},
    openSettings: () => {},
    openMenu: () => {},
    setExternalOwner: () => {},
  };

  return (
    <ChakraProvider theme={chakraTheme}>
      <ControllerThemeProvider value={ctrlTheme}>
        <ConnectionProvider value={connection}>{children}</ConnectionProvider>
      </ControllerThemeProvider>
    </ChakraProvider>
  );
}

function toThemeColor(val: string | ControllerColor | undefined) {
  if (typeof val === "undefined") {
    return;
  }

  if (typeof val === "string") {
    return val;
  }

  return {
    default: val.dark,
    _light: val.light,
  };
}
