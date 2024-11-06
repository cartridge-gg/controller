import { useContext } from "react";
import {
  ThemeContext,
  ConnectionContext,
  DataContext,
} from "@/components/context";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
