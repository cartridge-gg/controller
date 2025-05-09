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

const variants = [
  "darkest",
  "darker",
  "dark",
  "default",
  "light",
  "lighter",
  "lightest",
  "ghost",
] as const;
const sizes = ["xl", "2xl", "3xl"] as const;
const ranks = ["bronze", "silver", "gold"] as const;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col gap-3">
        {variants.map((variant) => (
          <div key={variant} className="grid grid-cols-4 items-center gap-6">
            <p className="text-sm text-foreground-100 capitalize text-medium">
              {variant}
            </p>
            {ranks.map((rank) => (
              <div key={`${variant}-${rank}`} className="flex gap-3">
                {sizes.map((size) => (
                  <AchievementPlayerBadge
                    key={`${variant}-${rank}-${size}`}
                    {...args}
                    variant={variant}
                    size={size}
                    rank={rank}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
