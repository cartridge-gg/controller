import { useContext } from "react";
import { ThemeContext, ConnectionContext } from "@/components/context";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}
