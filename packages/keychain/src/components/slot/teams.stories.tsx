import type { Meta, StoryObj } from "@storybook/react";
import { Teams } from "./teams";

// Mock team data for stories
const mockTeams = [
  {
    id: "cmcv7v80x0004qgmy5pqja21c",
    name: "cartridge",
    credits: 200000000,
    deployments: {
      totalCount: 1,
      edges: [{ node: { project: "dopewars" } }],
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
      totalCount: 6,
      edges: [
        { node: { project: "pixel-rpg" } },
        { node: { project: "racing-game" } },
        { node: { project: "puzzle-quest" } },
        { node: { project: "strategy-war" } },
        { node: { project: "adventure-land" } },
        { node: { project: "sports-arena" } },
      ],
    },
  },
];

const singleTeam = [mockTeams[0]];

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
