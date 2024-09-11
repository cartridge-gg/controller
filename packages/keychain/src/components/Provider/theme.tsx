import { ControllerTheme } from "@cartridge/controller";
import { useColorMode } from "@chakra-ui/react";
import { createContext, useEffect, ProviderProps } from "react";

export const ControllerThemeContext = createContext<ControllerTheme>(undefined);

export function ControllerThemeProvider({
  value,
  children,
}: ProviderProps<ControllerTheme>) {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(value.colorMode);
  }, [setColorMode, value.colorMode]);

  return (
    <ControllerThemeContext.Provider value={value}>
      {children}
    </ControllerThemeContext.Provider>
  );
}
