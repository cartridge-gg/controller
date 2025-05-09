import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPlayerAvatar } from "./player-avatar";

const meta: Meta<typeof AchievementPlayerAvatar> = {
  title: "Modules/Achievements/Player Avatar",
  component: AchievementPlayerAvatar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPlayerAvatar>;

export const Bal7hazar: Story = {
  args: {
    username: "bal7hazar",
    size: "lg",
  },
};

export const ClickSave: Story = {
  args: {
    username: "clicksave",
    size: "lg",
  },
};
