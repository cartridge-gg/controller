import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { controllerConfigs } from "@cartridge/presets";
import { mainnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, voyager } from "@starknet-react/core";
import { useThemeEffect } from "@cartridge/ui-next";
import { BrowserRouter } from "react-router-dom";

import { ConnectionContext } from "../src/components/provider/connection";
import { StoryParameters, useMockedConnection } from "./mock";
import {
  ControllerThemeContext,
  VerifiableControllerTheme,
} from "../src/context/theme";
import { TokensProvider } from "../src/components/provider/tokens";

export function Provider({
  children,
  parameters,
}: { parameters: StoryParameters } & PropsWithChildren) {
  const connection = useMockedConnection(parameters.connection);

  if (parameters.preset) {
    const config = controllerConfigs[parameters.preset];

    if (parameters.preset === "cartridge" && config.theme) {
      (config.theme as VerifiableControllerTheme).verified = true;
    }

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
          <TokensProvider>
            <ControllerThemeProvider theme={connection.theme}>
              <BrowserRouter>{children}</BrowserRouter>
            </ControllerThemeProvider>
          </TokensProvider>
        </ConnectionContext.Provider>
      </QueryClientProvider>
    </StarknetConfig>
  );
}

const queryClient = new QueryClient();

function ControllerThemeProvider({
  children,
  theme,
}: PropsWithChildren<{ theme: VerifiableControllerTheme }>) {
  useThemeEffect({ theme, assetUrl: "" });

  return (
    <ControllerThemeContext.Provider value={{ ...theme }}>
      {children}
    </ControllerThemeContext.Provider>
  );
}
