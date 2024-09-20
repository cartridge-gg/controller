import { ColorSchemeProvider } from "./colorScheme";
import { QueryParamsProvider } from "./query";
import { PropsWithChildren } from "react";
import { ConnectionProvider } from "./connection";

export function Provider({ children }: PropsWithChildren) {
  return (
    <QueryParamsProvider>
      <ColorSchemeProvider defaultScheme="system">
        <ConnectionProvider>{children}</ConnectionProvider>
      </ColorSchemeProvider>
    </QueryParamsProvider>
  );
}
