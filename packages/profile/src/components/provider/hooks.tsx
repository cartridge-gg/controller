import { useContext } from "react";
import { QueryParamsContext } from "./query";
import { ConnectionContext } from "./connection";
import { ColorSchemeProviderContext } from "./colorScheme";

export function useQueryParams() {
  const context = useContext(QueryParamsContext);
  if (context === undefined) {
    throw new Error("useQueryParams must be used within a QueryParamsProvider");
  }
  return context.searchParams;
}

export function useColorScheme() {
  const context = useContext(ColorSchemeProviderContext);

  if (context === undefined)
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");

  return context;
}

export function useConnection() {
  return useContext(ConnectionContext);
}
