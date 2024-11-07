import { PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { StarknetProvider } from "./StarknetProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <StarknetProvider>{children}</StarknetProvider>
    </ThemeProvider>
  );
}
