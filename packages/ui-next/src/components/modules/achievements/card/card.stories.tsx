import type { Meta, StoryObj } from "@storybook/react";
import { AchievementCard } from "./card";
import { AchievementBit, AchievementBits } from "@/index";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementCard> = {
  title: "Modules/Achievements/Card",
  component: AchievementCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    onPrevious: fn(),
    onNext: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AchievementCard>;

export const Squire: Story = {
  args: {
    name: "Squire",
    contentProps: {
      icon: "fa-seedling",
      title: "Squire",
      description: "Every journey begins with a single step",
      points: 20,
      difficulty: 12,
      tasks: [{ count: 1, total: 1, description: "Finish onboarding" }],
      timestamp: 1728717697,
    },
    pinProps: {
      pinned: true,
      onClick: fn(),
    },
    shareProps: {
      onClick: fn(),
    },
  },
};

export const SquirePinOnly: Story = {
  args: {
    name: "Squire",
    contentProps: {
      icon: "fa-seedling",
      title: "Squire",
      description: "Every journey begins with a single step",
      points: 20,
      difficulty: 12,
      tasks: [{ count: 1, total: 1, description: "Finish onboarding" }],
      timestamp: 1728717697,
    },
    pinProps: {
      pinned: true,
      onClick: fn(),
    },
  },
};

export const Battlelord: Story = {
  args: {
    name: "Battlelord",
    contentProps: {
      icon: "fa-khanda",
      title: "Battlelord 1",
      description: "Death smiles at us all. All we can do is smile back",
      points: 20,
      difficulty: 6,
      tasks: [{ count: 1, total: 2, description: "Conquer 5 realms" }],
    },
    children: (
      <AchievementBits>
        <AchievementBit completed onClick={fn()} />
        <AchievementBit active onClick={fn()} />
      </AchievementBits>
    ),
  },
};

export const Voyager: Story = {
  args: {
    name: "Voyager",
    contentProps: {
      icon: "fa-rocket",
      title: "Voyager",
      description: "Fortune favors the bold",
      points: 20,
      difficulty: 12,
      tasks: [
        { count: 1, total: 1, description: "Discover a tile" },
        { count: 0, total: 1, description: "Discover an ancient fragment" },
      ],
    },
  },
};
