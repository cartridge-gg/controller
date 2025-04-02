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
    onTabClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeTabs>;

export const Default: Story = {
  render: (args) => (
    <ArcadeTabs {...args}>
      <TabsContent value="inventory">Inventory content</TabsContent>
      <TabsContent value="achievements">Achievements content</TabsContent>
      <TabsContent value="leaderboard">Leaderboard content</TabsContent>
      <TabsContent value="guilds">Guilds content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
      <TabsContent value="metrics">Metrics content</TabsContent>
      <TabsContent value="about">About content</TabsContent>
      <TabsContent value="marketplace">Marketplace content</TabsContent>
    </ArcadeTabs>
  ),
};

export const Game: Story = {
  args: {
    defaultValue: "activity",
    order: ["activity", "leaderboard", "marketplace", "guilds", "about"],
  },
};

export const Player: Story = {
  args: {
    defaultValue: "inventory",
    order: ["inventory", "achievements", "activity"],
  },
};
