import React from "react";
import type { Decorator, Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { SonnerToaster } from "@cartridge/ui-next";
import { Provider } from "../src/components/provider";

import "../src/index.css";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const routerDecorator: Decorator = (Story, { parameters: { router } }) => {
  const params = router?.params || {}
  const path = Object.keys(params).length
    ? `/:${Object.keys(params).join("/:")}`
    : "/"
  const searchParams = new URLSearchParams(router?.searchParams || {});
  const url = `/${Object.values(params).join("/")}?${searchParams.toString()}`;

  return (
    <MemoryRouter initialEntries={[url]}>
      <Provider>
        <Routes>
          <Route
            path={path}
            element={<Story />}
          />
        </Routes>
        <SonnerToaster />
      </Provider>
    </MemoryRouter>
  );
};

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
    routerDecorator,
  ],
};

export default preview;
