import { useContext } from "react";
import { ThemeContext } from "#profile/context/theme";
import { ConnectionContext } from "#profile/context/connection";
import { DataContext } from "#profile/context/data";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
