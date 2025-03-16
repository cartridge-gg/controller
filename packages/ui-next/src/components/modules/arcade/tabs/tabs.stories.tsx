import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeTabs } from "./tabs";
import { fn } from "@storybook/test";

const meta: Meta<typeof ArcadeTabs> = {
  title: "Modules/Arcade/Tabs",
  component: ArcadeTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    discover: true,
    inventory: true,
    achievements: true,
    guilds: true,
    activity: true,
    onDiscoverClick: fn(),
    onInventoryClick: fn(),
    onAchievementsClick: fn(),
    onGuildsClick: fn(),
    onActivityClick: fn(),
    defaultValue: "discover",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeTabs>;

export const Default: Story = {};

export const Inventory: Story = {
  args: {
    defaultValue: "inventory",
  },
};
