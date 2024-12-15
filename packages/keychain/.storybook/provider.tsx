import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConnectionContext } from "../src/components/Provider/connection";
import {
  defaultTheme,
  controllerConfigs,
  ControllerTheme,
} from "@cartridge/presets";
import { mainnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, voyager } from "@starknet-react/core";
import { useThemeEffect } from "@cartridge/ui-next";
import { StoryParameters, useMockedConnection } from "./mock";
import { ControllerThemeContext } from "../src/context/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { useChakraTheme } from "../src/hooks/theme";

export function Provider({
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

const queryClient = new QueryClient();

function ControllerThemeProvider({
  children,
  theme = defaultTheme,
}: PropsWithChildren<{ theme?: ControllerTheme }>) {
  useThemeEffect({ theme, assetUrl: "" });
  const chakraTheme = useChakraTheme(theme);

  return (
    <ControllerThemeContext.Provider value={theme}>
      <ChakraProvider theme={chakraTheme}>{children}</ChakraProvider>
    </ControllerThemeContext.Provider>
  );
}
