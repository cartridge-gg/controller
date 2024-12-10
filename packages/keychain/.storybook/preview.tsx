import React, { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import type { Parameters, Preview } from "@storybook/react";
import Controller from "@cartridge/controller";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { ControllerThemeContext, useChakraTheme } from "../src/hooks/theme";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "../src/components/Provider/connection";
import { constants } from "starknet";
import { getChainName } from "@cartridge/utils";
import Script from "next/script";
import { ConnectCtx, ConnectionCtx } from "../src/utils/connection/types";
import { UpgradeInterface } from "../src/hooks/upgrade";
import {
  defaultTheme,
  controllerConfigs,
  SessionPolicies,
  ControllerTheme,
} from "@cartridge/presets";
import { mainnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, voyager } from "@starknet-react/core";

const inter = Inter({ subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  weight: "600",
  subsets: ["latin"],
});
import "../src/index.css";
import { useThemeEffect } from "@cartridge/ui-next";
import { ChakraProvider } from "@chakra-ui/react";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    preset: "cartridge",
    colorMode: "dark",
  },
  decorators: [
    (Story, { parameters }) => (
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
        <Script src="/noflash.js" />

        <Provider parameters={parameters as StoryParameters}>
          <Story />
        </Provider>
      </>
    ),
  ],
};

function Provider({
  children,
  parameters,
}: { parameters: StoryParameters } & PropsWithChildren) {
  const connection = useMockedConnection(parameters.connection);

  if (parameters.preset) {
    const config = controllerConfigs[parameters.preset];
    connection.theme = config.theme || connection.theme;
    connection.policies = config.policies || connection.policies;
  }

  return (
    <StarknetConfig
      chains={[mainnet]}
      explorer={voyager}
      provider={publicProvider()}
    >
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <ControllerThemeProvider theme={connection.theme}>
            {children}
          </ControllerThemeProvider>
        </ConnectionContext.Provider>
      </QueryClientProvider>
    </StarknetConfig>
  );
}

interface StoryParameters extends Parameters {
  connection?: {
    context?: ConnectionCtx;
    controller?: Controller;
    chainId?: string;
    upgrade?: UpgradeInterface;
  };
  preset?: string;
  policies?: SessionPolicies;
}

export function useMockedConnection({
  chainId = constants.StarknetChainId.SN_SEPOLIA,
  context = {
    type: "connect",
    origin: "http://localhost:3002",
    policies: [],
    resolve: () => {},
    reject: () => {},
  } as ConnectCtx,
  ...rest
}: StoryParameters["connection"] = {}): ConnectionContextValue {
  const chainName = getChainName(chainId);

  return {
    context,
    origin: "http://localhost:3002",
    rpcUrl: "http://api.cartridge.gg/x/sepolia",
    chainId,
    chainName,
    policies: {},
    theme: defaultTheme,
    prefunds: [],
    hasPrefundRequest: false,
    error: undefined,
    setContext: () => {},
    setController: () => {},
    closeModal: () => {},
    openModal: () => {},
    logout: () => {},
    openSettings: () => {},
    controller: {},
    upgrade: {},
    ...rest,
  };
}

const queryClient = new QueryClient();

export default preview;

export function ControllerThemeProvider({
  children,
  theme = defaultTheme,
}: PropsWithChildren<{ theme?: ControllerTheme }>) {
  useThemeEffect({ theme });
  const chakraTheme = useChakraTheme(theme);

  return (
    <ControllerThemeContext.Provider value={theme}>
      <ChakraProvider theme={chakraTheme}>{children}</ChakraProvider>
    </ControllerThemeContext.Provider>
  );
}
