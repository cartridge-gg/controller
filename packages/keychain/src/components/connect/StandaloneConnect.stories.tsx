import type { Meta, StoryObj } from "@storybook/react";
import { StandaloneConnect } from "./StandaloneConnect";
import { MemoryRouter } from "react-router-dom";

const meta = {
  component: StandaloneConnect,
  parameters: {
    connection: {
      origin: "https://cartridge.gg",
      theme: {
        name: "Cartridge",
        icon: "/cartridge-icon.svg",
      },
    },
  },
} satisfies Meta<typeof StandaloneConnect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    username: "player123",
  },
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={["/?redirect_url=https://cartridge.gg/app"]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const WithoutUsername: Story = {
  args: {
    username: undefined,
  },
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={["/?redirect_url=https://cartridge.gg/app"]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const UnverifiedApp: Story = {
  parameters: {
    connection: {
      origin: "https://untrusted-app.com",
      theme: {
        name: "Unverified Game",
        icon: "/unknown-icon.svg",
      },
      verified: false,
    },
  },
  args: {
    username: "player123",
  },
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={["/?redirect_url=https://untrusted-app.com/game"]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const CustomTheme: Story = {
  parameters: {
    connection: {
      origin: "https://example-game.com",
      theme: {
        name: "Example Game",
        icon: "/game-icon.svg",
      },
    },
  },
  args: {
    username: "gamer_pro",
  },
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={["/?redirect_url=https://example-game.com/start"]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
};
