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
import { ETH_CONTRACT_ADDRESS } from "../src/utils/token";
import { ConnectCtx, ConnectionCtx } from "../src/utils/connection/types";
import { UpgradeInterface } from "../src/hooks/upgrade";
import { defaultTheme, controllerConfigs } from "@cartridge/presets";

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
  const theme = parameters.preset || "cartridge";

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionContext.Provider value={connection}>
        <ControllerThemeProvider theme={theme}>
          {children}
        </ControllerThemeProvider>
      </ConnectionContext.Provider>
    </QueryClientProvider>
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
    policies: {
      contracts: {
        [ETH_CONTRACT_ADDRESS]: {
          methods: [
            {
              name: "Approve",
              entrypoint: "approve",
              description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            },
            {
              name: "Transfer",
              entrypoint: "transfer",
            },
            {
              name: "Mint",
              entrypoint: "mint",
            },
            {
              name: "Burn",
              entrypoint: "burn",
            },
            {
              name: "Allowance",
              entrypoint: "allowance",
            },
          ],
        },
      },
    },
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
  theme,
}: PropsWithChildren<{ theme?: string }>) {
  const preset = useMemo(() => {
    if (!theme) return defaultTheme;
    if (theme in controllerConfigs && controllerConfigs[theme].theme) {
      return controllerConfigs[theme].theme;
    }
    return defaultTheme;
  }, [theme]);

  const controllerTheme = useMemo(
    () => ({
      name: preset.name,
      icon: preset.icon,
      cover: preset.cover,
    }),
    [preset],
  );

  useThemeEffect({ theme: preset, assetUrl: "" });
  const chakraTheme = useChakraTheme(preset);

  return (
    <ControllerThemeContext.Provider value={controllerTheme}>
      <ChakraProvider theme={chakraTheme}>{children}</ChakraProvider>
    </ControllerThemeContext.Provider>
  );
}
