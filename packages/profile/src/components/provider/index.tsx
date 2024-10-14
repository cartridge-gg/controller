import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ColorSchemeProvider } from "./colorScheme";
import { QueryParamsProvider } from "./query";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <QueryParamsProvider>
      <ColorSchemeProvider defaultScheme="system">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ConnectionProvider>{children}</ConnectionProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ColorSchemeProvider>
    </QueryParamsProvider>
  );
}
