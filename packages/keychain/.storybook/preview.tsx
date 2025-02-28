import React from "react";
import type { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { SonnerToaster, useThemeEffect } from "@cartridge/ui-next";
import { BrowserRouter } from "react-router-dom";
import { voyager, jsonRpcProvider, StarknetConfig } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { num } from "starknet";
import { mockedConnection } from "#hooks/connection.mock";
import { controllerConfigs, defaultTheme } from "@cartridge/presets";

import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
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
    (Story, { parameters }) => {
      // This can be directly mocked once #1436 is merged
      useThemeEffect({
        theme: parameters.preset
          ? (controllerConfigs[parameters.preset].theme ?? defaultTheme)
          : defaultTheme,
        assetUrl: "",
      });

      return (
        // Render only third party providers which consumer hook is directly used across the source code and hard to mock otherwise
        <BrowserRouter>
          <StarknetConfig
            explorer={voyager}
            chains={[sepolia, mainnet]}
            defaultChainId={num.toBigInt(
              mockedConnection.controller!.chainId(),
            )}
            provider={jsonRpcProvider({
              rpc: () => ({ nodeUrl: mockedConnection.rpcUrl }),
            })}
          >
            <Story />
            <SonnerToaster />
          </StarknetConfig>
        </BrowserRouter>
      );
    },
  ],
};

export default preview;
