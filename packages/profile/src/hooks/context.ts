import { useContext } from "react";
import { ThemeContext, DataContext } from "@/components/context";
import { ConnectionContext } from "@/context/connection";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
