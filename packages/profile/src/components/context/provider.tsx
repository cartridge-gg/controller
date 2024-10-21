import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ColorSchemeProvider } from "./colorScheme";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";
import { AccountProvider } from "./account";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <ColorSchemeProvider defaultScheme="system">
        <CartridgeAPIProvider
          url={`${import.meta.env.VITE_CARTRIDGE_API_URL!}/query`}
        >
          <QueryClientProvider client={queryClient}>
            <ConnectionProvider>
              <AccountProvider>{children}</AccountProvider>
            </ConnectionProvider>
          </QueryClientProvider>
        </CartridgeAPIProvider>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
