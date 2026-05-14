import type { Meta, StoryObj } from "@storybook/react";
import { TeamEmailVerify } from "./team-email-verify";

const mockTeam = {
  id: "cmcv7v80x0004qgmy5pqja21c",
  name: "my-game-studio",
  credits: 0,
  strk: 0,
  email: null,
};

const meta: Meta<typeof TeamEmailVerify> = {
  title: "Slot/TeamEmailVerify",
  component: TeamEmailVerify,
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    team: mockTeam,
    onVerified: () => {},
    onBack: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Email input step shown when a team has no contact email before funding.",
      },
    },
  },
};
