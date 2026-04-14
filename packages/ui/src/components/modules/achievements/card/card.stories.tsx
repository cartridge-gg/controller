import type { Meta, StoryObj } from "@storybook/react";
import { AchievementCard } from "./card";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementCard> = {
  title: "Modules/Achievements/Card",
  component: AchievementCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementCard>;

export const Squire: Story = {
  args: {
    name: "SQUIRE",
    achievements: [
      {
        id: "1",
        index: 0,
        completed: true,
        content: {
          icon: "fa-seedling",
          title: "Squire",
          description: "Every journey begins with a single step",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
        pin: {
          pinned: true,
          onClick: fn(),
        },
        share: {
          website: "https://lootsurvivor.io",
          twitter: "https://x.com/lootsurvivor",
          timestamp: 1728717697,
          points: 20,
          difficulty: 12,
          title: "Squire",
        },
      },
    ],
  },
};

export const SquirePinOnly: Story = {
  args: {
    name: "Squire",
    achievements: [
      {
        id: "1",
        index: 0,
        completed: true,
        content: {
          icon: "fa-seedling",
          title: "Squire",
          description: "Every journey begins with a single step",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
        pin: {
          pinned: true,
          onClick: fn(),
        },
      },
    ],
  },
};

export const Battlelord: Story = {
  args: {
    name: "Battlelord",
    achievements: [
      {
        id: "1",
        index: 0,
        completed: true,
        content: {
          icon: "fa-swords",
          title: "Battlelord 1",
          description: "Death smiles at us all. All we can do is smile back",
          points: 20,
          difficulty: 16,
          hidden: false,
          tasks: [
            { id: "1", count: 2, total: 1, description: "Conquer 2 realms" },
          ],
        },
        pin: {
          pinned: false,
          onClick: fn(),
        },
        share: {
          website: "https://lootsurvivor.io",
          twitter: "https://x.com/lootsurvivor",
          timestamp: 1728717697,
          points: 20,
          difficulty: 12,
          title: "Battlelord 1",
        },
      },
      {
        id: "2",
        index: 1,
        completed: false,
        content: {
          icon: "fa-khanda",
          title: "Battlelord 2",
          description: "Death smiles at us all. All we can do is smile back",
          points: 40,
          difficulty: 6,
          hidden: false,
          tasks: [
            { id: "1", count: 2, total: 5, description: "Conquer 5 realms" },
          ],
        },
      },
    ],
  },
};

export const Voyager: Story = {
  args: {
    name: "Voyager",
    achievements: [
      {
        id: "1",
        index: 0,
        completed: true,
        content: {
          icon: "fa-rocket",
          title: "Voyager",
          description: "Fortune favors the bold",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Discover a tile" },
            {
              id: "2",
              count: 0,
              total: 1,
              description: "Discover an ancient fragment",
            },
          ],
        },
      },
    ],
  },
};

export const Hidden: Story = {
  args: {
    name: "Hidden",
    achievements: [
      {
        id: "1",
        index: 0,
        completed: false,
        content: {
          points: 20,
          difficulty: 12,
          hidden: true,
        },
      },
      {
        id: "2",
        index: 1,
        completed: false,
        content: {
          points: 20,
          difficulty: 12,
          hidden: true,
        },
      },
      {
        id: "3",
        index: 2,
        completed: false,
        content: {
          points: 20,
          difficulty: 12,
          hidden: true,
        },
      },
    ],
  },
};
