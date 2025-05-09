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
const ranks = ["default", "gold", "silver", "bronze"] as const;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col gap-3">
        {variants.map((variant) => (
          <div key={variant} className="grid grid-cols-5 items-center gap-6">
            <p className="text-sm text-foreground-100 capitalize text-medium">
              {variant}
            </p>
            {ranks.map((rank) => (
              <AchievementPlayerLabel {...args} variant={variant} rank={rank} />
            ))}
          </div>
        ))}
      </div>
    );
  },
};
