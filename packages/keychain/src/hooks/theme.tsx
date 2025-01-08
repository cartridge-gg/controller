import {
  ControllerThemeContext,
  VerifiableControllerTheme,
} from "@/context/theme";
import { useContext } from "react";

export function useControllerTheme() {
  const ctx = useContext<VerifiableControllerTheme | undefined>(
    ControllerThemeContext,
  );
  if (!ctx) {
    throw new Error("ControllerThemeProvider must be placed");
  }

  return ctx;
}
