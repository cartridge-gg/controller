import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ColorSchemeProvider } from "./colorScheme";
import { QueryParamsProvider } from "./query";
import { ConnectionProvider } from "./connection";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <QueryParamsProvider>
      <ColorSchemeProvider defaultScheme="system">
        <ConnectionProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ConnectionProvider>
      </ColorSchemeProvider>
    </QueryParamsProvider>
  );
}
