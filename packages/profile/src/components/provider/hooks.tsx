import { useContext } from "react";
import { QueryParamsContext } from "./query";
import { ThemeProviderContext } from "./theme";

export function useQueryParams() {
  const context = useContext(QueryParamsContext);
  if (context === undefined) {
    throw new Error("useQueryParams must be used within a QueryParamsProvider");
  }
  return context.searchParams;
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
