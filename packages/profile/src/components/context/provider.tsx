import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "./theme";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/utils/api/indexer";
import { DataProvider } from "./data";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <ThemeProvider defaultScheme="system">
        <CartridgeAPIProvider
          url={`${import.meta.env.VITE_CARTRIDGE_API_URL!}/query`}
        >
          <IndexerAPIProvider credentials="omit">
            <QueryClientProvider client={queryClient}>
              <ConnectionProvider>
                <DataProvider>{children}</DataProvider>
              </ConnectionProvider>
            </QueryClientProvider>
          </IndexerAPIProvider>
        </CartridgeAPIProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
