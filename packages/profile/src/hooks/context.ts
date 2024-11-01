import { useContext } from "react";
import { ColorSchemeContext, ConnectionContext } from "@/components/context";

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);

  if (context === undefined)
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");

  return context;
}

export function useConnection() {
  return useContext(ConnectionContext);
}
