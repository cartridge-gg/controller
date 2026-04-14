import type { Meta, StoryObj } from "@storybook/react";
import { AchievementTabs } from "./tabs";
import { TabsContent } from "@/index";

const meta: Meta<typeof AchievementTabs> = {
  title: "Modules/Achievements/Tabs",
  component: AchievementTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementTabs>;

export const Default: Story = {
  render: () => (
    <AchievementTabs count={4} total={10} rank={16}>
      <TabsContent className="p-0 mt-0" value="achievements">
        <h1 className="text-foreground-100 p-4">Achievements content</h1>
      </TabsContent>
      <TabsContent className="p-0 mt-0" value="leaderboard">
        <h1 className="text-foreground-100 p-4">Leaderboard content</h1>
      </TabsContent>
    </AchievementTabs>
  ),
};
