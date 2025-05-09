import React from "react";
import { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { themes } from "@storybook/theming";
import { SonnerToaster } from "../src/components/primitives/sonner";
import { Toaster } from "../src/components/primitives/toaster";

import "../src/index.css";
import { useThemeEffect } from "../dist";
import { defaultTheme } from "@cartridge/presets";

const loadScript = (src: string) => {
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.head.appendChild(script);
};

// Add CSS styles directly to the head
const styleTag = document.createElement('style');
styleTag.textContent = `
  #responsive-wrapper {
    width: 432px !important;
    max-height: 600px !important;
    overflow: auto !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
`;
document.head.appendChild(styleTag);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "dark",
    }),
    (Story) => {
      useThemeEffect({ theme: defaultTheme, assetUrl: "https://x.cartridge.gg" });
      loadScript("/fontawesome/js/fontawesome.min.js");
      loadScript("/fontawesome/js/solid.min.js");
      loadScript("/fontawesome/js/thin.min.js");

      return (
        <>
          <Story />
          <SonnerToaster />
          <Toaster />
        </>
      )
    },
  ],
};

export default preview;
