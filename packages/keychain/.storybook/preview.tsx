import React from "react";
import { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    themes: {
      default: "dark",
      list: [
        { name: "dark", class: "dark" },
        { name: "light", class: "light" }
      ]
    }
  },
  decorators: [
    (Story) => (
      <>
        <Story />
      </>
    ),
  ],
};

export default preview;
