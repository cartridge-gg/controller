import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { mainnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, voyager } from "@starknet-react/core";
import { BrowserRouter } from "react-router-dom";
import { TokensProvider } from "@cartridge/utils";
import { ConnectionContext } from "../src/components/provider/connection";
import { UIProvider } from "../src/components/provider/ui";
import { StoryParameters, useMockedConnection } from "./mock";

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
          <UIProvider>
            <TokensProvider
              address={parameters.connection?.controller?.address()}
              provider={parameters.connection?.controller?.provider}
            >
              <BrowserRouter>{children}</BrowserRouter>
            </TokensProvider>
          </UIProvider>
        </ConnectionContext.Provider >
      </QueryClientProvider >
    </StarknetConfig >
  );
}

const queryClient = new QueryClient();
