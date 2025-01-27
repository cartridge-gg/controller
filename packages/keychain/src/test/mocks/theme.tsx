import { ReactNode } from "react";
import { ControllerThemeContext } from "@/context/theme";
import { VerifiableControllerTheme } from "@/context/theme";

export const defaultMockTheme: VerifiableControllerTheme = {
  verified: true,
  name: "test",
  icon: "test-icon",
  cover: "test-cover",
};

export function withTheme(
  children: ReactNode,
  theme: VerifiableControllerTheme = defaultMockTheme,
) {
  return (
    <ControllerThemeContext.Provider value={theme}>
      {children}
    </ControllerThemeContext.Provider>
  );
}
