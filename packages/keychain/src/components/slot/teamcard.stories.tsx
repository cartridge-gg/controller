import type { Meta, StoryObj } from "@storybook/react";
import { TeamCard } from "./teams";

// Mock team data for TeamCard stories
const mockTeams = [
  {
    id: "cmcv7v80x0004qgmy5pqja21c",
    name: "cartridge",
    credits: 200000000,
    strk: 250000000,
  },
  {
    id: "cmcv7v80x0004qgmy5pqja22d",
    name: "click-deleteme",
    credits: 0,
    strk: 0,
  },
  {
    id: "cmcv7v80x0004qgmy5pqja23e",
    name: "my-game-studio",
    credits: 1500000000,
    strk: 1250000000,
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
        story: "Shows a team card with credits and STRK balance.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    team: mockTeams[1], // click-deleteme with no funding balance
    onFundTeam: () => {},
    onBack: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a team card with no credits or STRK balance.",
      },
    },
  },
};

export const LowBalance: Story = {
  args: {
    team: {
      id: "single-deploy-team",
      name: "simple-project",
      credits: 50000000,
      strk: 10000000,
    },
    onFundTeam: () => {},
    onBack: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a team card with moderate funding balances.",
      },
    },
  },
};
