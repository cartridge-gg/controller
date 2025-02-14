import type { Meta, StoryObj } from "@storybook/react";
import { BitsAchievement } from "./bits";
import { BitAchievement } from "../bit/bit";
import { fn } from "@storybook/test";

const meta: Meta<typeof BitsAchievement> = {
  title: "Modules/Achievements/Bits",
  component: BitsAchievement,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof BitsAchievement>;

export const Default: Story = {
  render: () => (
    <BitsAchievement>
      <BitAchievement completed onClick={fn()} />
      <BitAchievement completed onClick={fn()} />
      <BitAchievement completed active onClick={fn()} />
    </BitsAchievement>
  ),
};

export const Mixed: Story = {
  render: () => (
    <BitsAchievement>
      <BitAchievement completed onClick={fn()} />
      <BitAchievement active onClick={fn()} />
      <BitAchievement onClick={fn()} />
    </BitsAchievement>
  ),
};
