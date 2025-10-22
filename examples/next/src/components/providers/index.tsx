"use client";

import { PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ControllerConfigProvider } from "./ControllerConfigProvider";
import dynamic from "next/dynamic";

const StarknetProviderClient = dynamic(
  () => import("./StarknetProvider").then((mod) => mod.StarknetProvider),
  { ssr: false },
);

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ControllerConfigProvider>
        <StarknetProviderClient>{children}</StarknetProviderClient>
      </ControllerConfigProvider>
    </ThemeProvider>
  );
}
