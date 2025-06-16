import type { Meta, StoryObj } from "@storybook/react";
import { SessionCard } from "./session-card";

const meta = {
  title: "components/settings/Session Card",
  component: SessionCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    sessionName: "Session 1",
    expiresAt: 1630000000000n,
    sessionOs: "macOS",
    onDelete: async () => {
      console.log("Delete session");
    },
  },
} satisfies Meta<typeof SessionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
