import { useThemeEffect } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { PropsWithChildren } from "react";
import { ControllerThemeContext } from "@/context/theme";

export function ControllerThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useConnection();

  useThemeEffect({ theme, assetUrl: "" });

  return (
    <ControllerThemeContext.Provider value={theme}>
      {children}
    </ControllerThemeContext.Provider>
  );
}
