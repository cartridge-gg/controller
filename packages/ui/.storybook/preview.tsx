import React from "react";
import { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { themes } from "@storybook/theming";
import { SonnerToaster } from "../src/components/primitives/sonner";
import { Toaster } from "../src/components/primitives/toaster";

import "../src/index.css";

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
    (Story) => (
      <>
        <Story />
        <SonnerToaster />
        <Toaster />
      </>
    ),
  ],
};

export default preview;
