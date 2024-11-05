import { useContext } from "react";
import { ColorSchemeContext, ConnectionContext } from "@/components/context";
import { DataContext } from "@/components/context/data";

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);

  if (context === undefined)
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");

  return context;
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
