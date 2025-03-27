import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPlayerBadge } from "./player-badge";

const meta: Meta<typeof AchievementPlayerBadge> = {
  title: "Modules/Achievements/Player Badge",
  component: AchievementPlayerBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPlayerBadge>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <AchievementPlayerBadge {...args} />
          <AchievementPlayerBadge {...args} variant="bronze" />
          <AchievementPlayerBadge {...args} variant="silver" />
          <AchievementPlayerBadge {...args} variant="gold" />
        </div>
        <div className="flex gap-3">
          <AchievementPlayerBadge {...args} size="2xl" />
          <AchievementPlayerBadge {...args} variant="bronze" size="2xl" />
          <AchievementPlayerBadge {...args} variant="silver" size="2xl" />
          <AchievementPlayerBadge {...args} variant="gold" size="2xl" />
        </div>
      </div>
    );
  },
};
