import React from "react";
import { PropsWithChildren } from "react";
import type { Preview } from "@storybook/react";
import {
  ControllerThemeProvider,
  useChakraTheme,
  useControllerThemePreset,
} from "../src/hooks/theme";
import {
  ConnectionContextValue,
  ConnectionProvider,
} from "../src/components/Provider/connection";
import { ChakraProvider } from "@chakra-ui/react";
import { ControllerTheme } from "@cartridge/controller";
import { Inter, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  weight: "600",
  subsets: ["latin"],
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <style
          // @ts-expect-error type error
          jsx
          global
        >{`
          :root {
            --font-inter: ${inter.style.fontFamily};
            --font-ibm-plex-mono: ${ibmPlexMono.style.fontFamily};
          }

          body {
            background: var(--chakra-colors-solid-bg);
          }

          html,
          body {
            -ms-overflow-style: none; /* Internet Explorer 10+ */
            scrollbar-width: none; /* Firefox */
          }
          body::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
        `}</style>

        <Provider>
          <Story />
        </Provider>
      </>
    ),
  ],
};

function Provider({ children }: PropsWithChildren) {
  const preset = useControllerThemePreset();
  const chakraTheme = useChakraTheme(preset);
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

export default preview;
