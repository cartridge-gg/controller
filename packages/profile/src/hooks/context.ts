import { useContext } from "react";
import { DataContext } from "@/components/context/data";
import { ThemeContext, ConnectionContext } from "@/components/context";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
