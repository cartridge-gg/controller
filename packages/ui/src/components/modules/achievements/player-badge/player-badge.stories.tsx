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
const sizes = ["xl", "2xl", "3xl", "4xl"] as const;
const ranks = ["bronze", "silver", "gold"] as const;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col gap-6">
        {variants.map((variant, index) => (
          <div key={variant} className="flex items-center gap-6 h-16">
            <p className="text-sm text-foreground-100 capitalize text-medium min-w-16">
              {variant}
            </p>
            {ranks.map((rank) => (
              <div key={`${variant}-${rank}`} className="flex gap-6">
                {sizes.map((size) => (
                  <AchievementPlayerBadge
                    key={`${variant}-${rank}-${size}`}
                    {...args}
                    variant={variant}
                    size={size}
                    rank={rank}
                    username={`player${index}`}
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
