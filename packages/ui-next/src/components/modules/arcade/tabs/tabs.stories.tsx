import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeTabs } from "./tabs";
import { fn } from "@storybook/test";
import { TabsContent } from "@/index";

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
    leaderboard: true,
    guilds: true,
    activity: true,
    onDiscoverClick: fn(),
    onInventoryClick: fn(),
    onAchievementsClick: fn(),
    onLeaderboardClick: fn(),
    onGuildsClick: fn(),
    onActivityClick: fn(),
    defaultValue: "discover",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeTabs>;

export const Default: Story = {
  render: (args) => (
    <ArcadeTabs {...args}>
      <TabsContent value="discover">Discover content</TabsContent>
      <TabsContent value="inventory">Inventory content</TabsContent>
      <TabsContent value="achievements">Achievements content</TabsContent>
      <TabsContent value="leaderboard">Leaderboard content</TabsContent>
      <TabsContent value="guilds">Guilds content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
    </ArcadeTabs>
  ),
};

export const Inventory: Story = {
  args: {
    defaultValue: "inventory",
  },
};

export const Reversed: Story = {
  args: {
    defaultValue: "activity",
    order: ["activity", "guilds", "achievements", "inventory", "discover"],
  },
};
