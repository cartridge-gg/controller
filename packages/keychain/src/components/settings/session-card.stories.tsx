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
    sessionName: "WP-NUMS-APPCHAIN",
  },
} satisfies Meta<typeof SessionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
