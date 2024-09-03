import { ThemeProvider } from "./theme";
import { QueryParamsProvider } from "./query";
import { PropsWithChildren } from "react";

export function Provider({ children }: PropsWithChildren) {
  return (
    <QueryParamsProvider>
      <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
    </QueryParamsProvider>
  );
}
