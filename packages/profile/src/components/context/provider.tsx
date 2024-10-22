import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ColorSchemeProvider } from "./colorScheme";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";
import { AccountProvider } from "./account";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <ColorSchemeProvider defaultScheme="system">
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider>
            <AccountProvider>{children}</AccountProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
