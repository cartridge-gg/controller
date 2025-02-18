import type { Meta, StoryObj } from "@storybook/react";
import { AchievementTab } from "./tab";
import AchievementCounter from "../counter/counter";
import { Tabs, TabsList } from "@/index";
import AchievementLeaderboardCounter from "../leaderboard-counter/leaderboard-counter";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Tabs defaultValue="achievements">
    <TabsList className="h-auto grid w-full grid-cols-2 gap-x-4 bg-transparent p-0">
      {children}
    </TabsList>
  </Tabs>
);

const meta: Meta<typeof AchievementTab> = {
  title: "Modules/Achievements/Tab",
  component: AchievementTab,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: "achievements",
    label: "Achievements",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementTab>;

export const Default: Story = {
  render: () => (
    <Wrapper>
      <AchievementTab
        value="achievements"
        label="Achievements"
        active
        counter={<AchievementCounter count={4} total={10} />}
      />
    </Wrapper>
  ),
};

export const Inactive: Story = {
  render: () => (
    <Wrapper>
      <AchievementTab
        value="leaderboard"
        label="Leaderboard"
        active={false}
        counter={<AchievementLeaderboardCounter rank={16} />}
      />
    </Wrapper>
  ),
};
