import { useEffect } from "react";

export function useThemeEffect({
  theme,
  assetUrl,
}: {
  theme: ControllerTheme;
  assetUrl: string;
}) {
  useEffect(() => {
    if (!theme) return;

    // Helper function to update theme properties
    const updateThemeProperties = (colorMode: "light" | "dark") => {
      // Set icon
      document.documentElement.style.setProperty(
        "--theme-icon-url",
        theme.icon.startsWith("http")
          ? `url("${theme.icon}")`
          : `url("${assetUrl}${theme.icon}")`,
      );

      // Set cover
      const coverValue =
        typeof theme.cover === "string" ? theme.cover : theme.cover["dark"];
      const coverUrl = coverValue.startsWith("http")
        ? `url("${coverValue}")`
        : `url("${assetUrl}${coverValue}")`;
      document.documentElement.style.setProperty("--theme-cover-url", coverUrl);

      // Set colors if they exist
      if (theme.colors) {
        if (theme.colors.primary) {
          const val =
            typeof theme.colors.primary === "string"
              ? theme.colors.primary
              : theme.colors.primary[colorMode];
          document.documentElement.style.setProperty("--primary-100", val);
        }

        if (theme.colors.primaryForeground) {
          const val =
            typeof theme.colors.primaryForeground === "string"
              ? theme.colors.primaryForeground
              : theme.colors.primaryForeground[colorMode];
          document.documentElement.style.setProperty(
            "--primary-foreground-100",
            val,
          );
        }
      }
    };

    // Set initial values based on current color mode
    const initialColorMode = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    updateThemeProperties(initialColorMode);

    // Watch for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const colorMode = (mutation.target as HTMLElement).classList.contains(
          "dark",
        )
          ? "dark"
          : "light";
        updateThemeProperties(colorMode);
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, [theme, assetUrl]);
}

// dup of @cartridge/controller/types
export type ControllerThemeOption = string | ControllerTheme;

export type ControllerTheme = {
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colors?: ControllerColors;
};

export type ControllerColors = {
  primary?: ControllerColor;
  primaryForeground?: ControllerColor;
};

export type ControllerColor = ThemeValue<string>;

export type ThemeValue<T> = T | { dark: T; light: T };
