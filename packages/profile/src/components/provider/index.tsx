import { ThemeProvider } from "./theme";
import { PropsWithChildren } from "react";

export function Provider({ children }: PropsWithChildren) {
  return <ThemeProvider defaultTheme="system">{children}</ThemeProvider>;
}
