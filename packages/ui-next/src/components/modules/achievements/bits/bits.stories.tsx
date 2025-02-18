import type { Meta, StoryObj } from "@storybook/react";
import { AchievementBits } from "./bits";
import { AchievementBit } from "../bit/bit";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementBits> = {
  title: "Modules/Achievements/Bits",
  component: AchievementBits,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementBits>;

export const Default: Story = {
  render: () => (
    <AchievementBits>
      <AchievementBit completed onClick={fn()} />
      <AchievementBit completed onClick={fn()} />
      <AchievementBit completed active onClick={fn()} />
    </AchievementBits>
  ),
};

export const Mixed: Story = {
  render: () => (
    <AchievementBits>
      <AchievementBit completed onClick={fn()} />
      <AchievementBit active onClick={fn()} />
      <AchievementBit onClick={fn()} />
    </AchievementBits>
  ),
};
