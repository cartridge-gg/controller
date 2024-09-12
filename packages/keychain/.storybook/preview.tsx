import React, { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import type { Parameters, Preview } from "@storybook/react";
import { ChakraProvider } from "@chakra-ui/react";
import { ControllerTheme } from "@cartridge/controller";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import {
  ControllerThemeProvider,
  useChakraTheme,
  useControllerThemePreset,
} from "../src/hooks/theme";
import {
  ConnectionContextValue,
  ConnectionProvider,
} from "../src/components/Provider/connection";
import { constants } from "starknet";
import { getChainName } from "../src/utils/network";
import { ETH_CONTRACT_ADDRESS } from "../src/utils/token";

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

        <Provider parameters={parameters as StoryParameters}>
          <Story />
        </Provider>
      </>
    ),
  ],
};

interface StoryParameters extends Parameters {
  connection?: {
    chainId?: string;
  };
}

function Provider({
  children,
  parameters,
}: { parameters: StoryParameters } & PropsWithChildren) {
  const preset = useControllerThemePreset();
  const chakraTheme = useChakraTheme(preset);
  const ctrlTheme: ControllerTheme = {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    cover: preset.cover,
    colorMode: "dark",
  };
  const connection = useMockedConnection(parameters["connection"]);

  return (
    <ChakraProvider theme={chakraTheme}>
      <QueryClientProvider client={queryClient}>
        <ControllerThemeProvider value={ctrlTheme}>
          <ConnectionProvider value={connection}>{children}</ConnectionProvider>
        </ControllerThemeProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

function useMockedConnection({
  chainId = constants.StarknetChainId.SN_SEPOLIA,
}: StoryParameters["connection"] = {}): ConnectionContextValue {
  const chainName = getChainName(chainId);

  return {
    context: undefined,
    controller: {},
    origin: "http://localhost:3002",
    rpcUrl: "http://api.cartridge.gg/x/sepolia",
    chainId,
    chainName,
    policies: [
      {
        target: ETH_CONTRACT_ADDRESS,
        method: "approve",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      },
      {
        target: ETH_CONTRACT_ADDRESS,
        method: "transfer",
      },
      {
        target: ETH_CONTRACT_ADDRESS,
        method: "mint",
      },
      {
        target: ETH_CONTRACT_ADDRESS,
        method: "burn",
      },
      {
        target: ETH_CONTRACT_ADDRESS,
        method: "allowance",
      },
    ],
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
}

const queryClient = new QueryClient();

export default preview;
