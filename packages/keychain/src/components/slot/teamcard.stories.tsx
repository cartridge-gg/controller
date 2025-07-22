import type { Meta, StoryObj } from "@storybook/react";
import { TeamCard } from "./teams";

// Mock team data for TeamCard stories
const mockTeams = [
  {
    id: "cmcv7v80x0004qgmy5pqja21c",
    name: "cartridge",
    credits: 200000000,
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
    credits: 1500000000,
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

const meta: Meta<typeof TeamCard> = {
  title: "Slot/TeamCard",
  component: TeamCard,
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
    team: {
      description: "Team object to display",
    },
    onFundTeam: {
      description: "Callback when fund team button is clicked",
      action: "fundTeam",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCredits: Story = {
  args: {
    team: mockTeams[0], // cartridge team with credits
    onFundTeam: () => {},
    onBack: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a team card with credits and multiple deployments.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    team: mockTeams[1], // click-deleteme with no credits/deployments
    onFundTeam: () => {},
    onBack: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a team card with no credits and no deployments (empty state).",
      },
    },
  },
};

export const SingleDeployment: Story = {
  args: {
    team: {
      id: "single-deploy-team",
      name: "simple-project",
      credits: 50000000,
      deployments: {
        totalCount: 1,
        edges: [{ node: { project: "hello-world" } }],
      },
    },
    onFundTeam: () => {},
    onBack: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a team card with moderate credits and a single deployment.",
      },
    },
  },
};
