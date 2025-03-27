import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPlayerLabel } from "./player-label";

const meta: Meta<typeof AchievementPlayerLabel> = {
  title: "Modules/Achievements/Player Label",
  component: AchievementPlayerLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },

  args: {
    username: "bal7hazar",
    address: "0x1234567890123456789012345678901234567890",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPlayerLabel>;

export const Default: Story = {};

export const Gold: Story = {
  args: {
    variant: "gold",
  },
};

export const Silver: Story = {
  args: {
    variant: "silver",
  },
};

export const Bronze: Story = {
  args: {
    variant: "bronze",
  },
};
