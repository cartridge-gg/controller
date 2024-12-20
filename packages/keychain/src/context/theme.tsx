import { ControllerTheme } from "@cartridge/presets";
import { createContext } from "react";

export type VerifiableControllerTheme = ControllerTheme & {
  verified: boolean;
};

export const ControllerThemeContext = createContext<
  VerifiableControllerTheme | undefined
>(undefined);
