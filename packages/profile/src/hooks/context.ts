import { useContext } from "react";
import { ConnectionContext } from "@/components/provider/connection";
import { ColorSchemeProviderContext } from "@/components/provider/colorScheme";

export function useColorScheme() {
  const context = useContext(ColorSchemeProviderContext);

  if (context === undefined)
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");

  return context;
}

export function useConnection() {
  return useContext(ConnectionContext);
}
