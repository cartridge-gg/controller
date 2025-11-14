import type { Meta, StoryObj } from "@storybook/react";
import { StandaloneConnect } from "./StandaloneConnect";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

function NavigationWrapper({
  children,
  redirectUrl,
}: {
  children: React.ReactNode;
  redirectUrl: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/?redirect_url=${encodeURIComponent(redirectUrl)}`, {
      replace: true,
    });
  }, [navigate, redirectUrl]);

  return <>{children}</>;
}

export const Default: Story = {
  args: {
    username: "player123",
  },
  decorators: [
    (Story) => (
      <NavigationWrapper redirectUrl="https://cartridge.gg/app">
        <Story />
      </NavigationWrapper>
    ),
  ],
};

export const WithoutUsername: Story = {
  args: {
    username: undefined,
  },
  decorators: [
    (Story) => (
      <NavigationWrapper redirectUrl="https://cartridge.gg/app">
        <Story />
      </NavigationWrapper>
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
      <NavigationWrapper redirectUrl="https://untrusted-app.com/game">
        <Story />
      </NavigationWrapper>
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
      <NavigationWrapper redirectUrl="https://example-game.com/start">
        <Story />
      </NavigationWrapper>
    ),
  ],
};
