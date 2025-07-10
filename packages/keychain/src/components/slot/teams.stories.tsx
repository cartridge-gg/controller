import type { Meta, StoryObj } from "@storybook/react";
import { Teams } from "./teams";

// Mock team data for stories
const mockTeams = [
  {
    id: "cmcv7v80x0004qgmy5pqja21c",
    name: "cartridge",
    credits: 2000,
    deployments: {
      totalCount: 6,
      edges: [
        { node: { project: "dopewars" } },
        { node: { project: "provable-dw" } },
        { node: { project: "slot-e2e-infra" } },
        { node: { project: "trading-game" } },
        { node: { project: "nft-marketplace" } },
        { node: { project: "defi-protocol" } },
      ],
    },
  },
  {
    id: "cmcv7v80x0004qgmy5pqja22d",
    name: "click-deleteme",
    credits: 0,
    deployments: {
      totalCount: 0,
      edges: [],
    },
  },
  {
    id: "cmcv7v80x0004qgmy5pqja23e",
    name: "my-game-studio",
    credits: 15000,
    deployments: {
      totalCount: 12,
      edges: [
        { node: { project: "pixel-rpg" } },
        { node: { project: "racing-game" } },
        { node: { project: "puzzle-quest" } },
        { node: { project: "strategy-war" } },
        { node: { project: "adventure-land" } },
        { node: { project: "sports-arena" } },
        { node: { project: "card-battle" } },
        { node: { project: "tower-defense" } },
        { node: { project: "match-three" } },
        { node: { project: "platformer-jump" } },
        { node: { project: "shooter-space" } },
        { node: { project: "simulation-city" } },
      ],
    },
  },
];

const singleTeam = [mockTeams[0]];

const highCreditsTeam = [
  {
    id: "cmcv7v80x0004qgmy5pqja24f",
    name: "mega-corp",
    credits: 1000000,
    deployments: {
      totalCount: 5,
      edges: [
        { node: { project: "enterprise-app" } },
        { node: { project: "blockchain-infra" } },
        { node: { project: "ai-platform" } },
        { node: { project: "data-analytics" } },
        { node: { project: "cloud-services" } },
      ],
    },
  },
];

const meta: Meta<typeof Teams> = {
  title: "Slot/Teams",
  component: Teams,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    teams: {
      description: "Array of team objects to display",
    },
    error: {
      description: "Error state",
    },
    onFundTeam: {
      description: "Callback when fund team button is clicked",
      action: "fundTeam",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teams: mockTeams,
    isLoading: false,
    error: false,
    onFundTeam: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the Teams component with sample team data including credits and deployments.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    teams: [],
    isLoading: true,
    error: false,
    onFundTeam: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the loading state while teams data is being fetched.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    teams: [],
    isLoading: false,
    error: false,
    onFundTeam: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the empty state when no teams are found.",
      },
    },
  },
};

export const SingleTeam: Story = {
  args: {
    teams: singleTeam,
    isLoading: false,
    error: false,
    onFundTeam: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a single team card.",
      },
    },
  },
};

export const MultipleTeams: Story = {
  args: {
    teams: mockTeams,
    isLoading: false,
    error: false,
    onFundTeam: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows multiple team cards with different credit amounts and deployment counts.",
      },
    },
  },
};

export const HighCreditsTeam: Story = {
  args: {
    teams: highCreditsTeam,
    isLoading: false,
    error: false,
    onFundTeam: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a team with very high credits to test number formatting.",
      },
    },
  },
};
