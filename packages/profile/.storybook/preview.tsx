import React from "react";
import type { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { SonnerToaster } from "@cartridge/ui-next";
import { Provider } from "../src/components/provider";

import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    preset: "cartridge",
    colorMode: "dark",
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "hsl(var(--background))",
        },
        {
          name: "light",
          value: "hsl(var(--background))",
        },
      ],
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
    (Story,
      // { parameters }
    ) => (
      <Provider>
        <Story />
        <SonnerToaster />
      </Provider>
    ),
  ],
};

export default preview;
