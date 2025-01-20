import { useContext } from "react";
import { ThemeContext } from "@/components/context";
import { ConnectionContext } from "@/context/connection";
import { DataContext } from "@/context/data";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
