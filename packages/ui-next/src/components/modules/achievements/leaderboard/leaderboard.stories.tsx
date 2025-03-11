import type { Meta, StoryObj } from "@storybook/react";
import { AchievementLeaderboard } from "./leaderboard";
import AchievementLeaderboardRow from "../leaderboard-row/leaderboard-row";

const meta: Meta<typeof AchievementLeaderboard> = {
  title: "Modules/Achievements/Leaderboard",
  component: AchievementLeaderboard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementLeaderboard>;

const data = [
  {
    name: "bal7hazar",
    points: 950,
    highlight: false,
  },
  {
    name: "player",
    points: 900,
    highlight: false,
  },
  {
    name: "player",
    points: 820,
    highlight: false,
  },
  {
    name: "player",
    points: 800,
    highlight: false,
  },
  {
    name: "player",
    points: 800,
    highlight: false,
  },
  {
    name: "player",
    points: 790,
    highlight: false,
  },
  {
    name: "player",
    points: 775,
    highlight: false,
  },
  {
    name: "player",
    points: 720,
    highlight: false,
  },
  {
    name: "player",
    points: 700,
    highlight: false,
  },
  {
    name: "player",
    points: 690,
    highlight: false,
  },
  {
    name: "player",
    points: 670,
    highlight: false,
  },
  {
    name: "player",
    points: 650,
    highlight: false,
  },
  {
    name: "player",
    points: 650,
    highlight: false,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
  },
  {
    name: "shinobi",
    points: 640,
    highlight: true,
  },
];
Array.from({ length: 100 }).forEach((_, index) => {
  data.push({
    name: `player ${index}`,
    points: 640,
    highlight: false,
  });
});

export const Default: Story = {
  render: () => (
    <AchievementLeaderboard className="h-[657px]">
      {data.map((item, index) => (
        <AchievementLeaderboardRow
          key={index}
          pins={[
            { id: "1", icon: "fa-seedling" },
            { id: "2", icon: "fa-swords" },
          ]}
          rank={index + 1}
          name={item.name}
          points={item.points}
          highlight={item.highlight}
        />
      ))}
    </AchievementLeaderboard>
  ),
};
