import { ThemeProvider } from "./theme";
import { QueryParamsProvider } from "./query";
import { PropsWithChildren } from "react";
import { ConnectionProvider } from "./connection";

export function Provider({ children }: PropsWithChildren) {
  return (
    <QueryParamsProvider>
      <ThemeProvider defaultTheme="system">
        <ConnectionProvider>{children}</ConnectionProvider>
      </ThemeProvider>
    </QueryParamsProvider>
  );
}
