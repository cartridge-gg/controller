import React from "react";
import type { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { SonnerToaster } from "@cartridge/ui-next";

import { StoryParameters } from "./mock";
import { Provider } from "./provider";

import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    viewport: {
      defaultViewport: 'mobile1',
      viewports: {
        mobile1: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        desktop1: {
          name: 'Desktop',
          styles: {
            width: '432px',
            height: '600px',
          },
        },
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
    (Story, { parameters }) => (
      <Provider parameters={parameters as StoryParameters}>
        <Story />
        <SonnerToaster />
      </Provider>
    ),
  ],
};

export default preview;
