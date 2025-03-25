import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { mainnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, voyager } from "@starknet-react/core";
import { BrowserRouter } from "react-router-dom";
import { ConnectionContext } from "../src/components/provider/connection";
import { UIProvider } from "../src/components/provider/ui";
import {
  MockUpgradeProvider,
  StoryParameters,
  useMockedConnection,
} from "./mock";
import { TokensProvider } from "../src/components/provider/tokens";
import { PostHogProvider } from "../src/components/provider/posthog";

export function Provider({
  children,
  parameters,
}: { parameters: StoryParameters } & PropsWithChildren) {
  const connection = useMockedConnection(parameters);

  return (
    <StarknetConfig
      chains={[mainnet]}
      explorer={voyager}
      provider={publicProvider()}
    >
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <PostHogProvider>
            <MockUpgradeProvider controller={connection.controller}>
              <UIProvider>
                <TokensProvider>
                  <BrowserRouter>{children}</BrowserRouter>
                </TokensProvider>
              </UIProvider>
            </MockUpgradeProvider>
          </PostHogProvider>
        </ConnectionContext.Provider>
      </QueryClientProvider>
    </StarknetConfig>
  );
}

const queryClient = new QueryClient();
