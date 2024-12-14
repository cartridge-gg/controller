import React from "react";
import type { Preview } from "@storybook/react";
import { StoryParameters } from "./mock";
import { Provider } from "./provider";

import "../src/index.css"

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
  },
  decorators: [
    (Story, { parameters }) => (
      <Provider parameters={parameters as StoryParameters}>
        <Story />
      </Provider>
    ),
  ],
};

export default preview;
