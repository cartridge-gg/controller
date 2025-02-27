import type { Meta, StoryObj } from "@storybook/react";
import { SessionCard } from "./session-card";

const meta: Meta<typeof SessionCard> = {
  title: "Modules/Settings/Session Card",
  component: SessionCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof SessionCard>;

export const Default: Story = {
  args: {
    sessionName: "Session 1",
  },
};
