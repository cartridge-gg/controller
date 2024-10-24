import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ColorSchemeProvider } from "./colorScheme";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <ColorSchemeProvider defaultScheme="system">
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider>{children}</ConnectionProvider>
        </QueryClientProvider>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
