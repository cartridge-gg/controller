import type { Meta, StoryObj } from "@storybook/react";
import { LeaderboardTable } from "./table";
import LeaderboardTableRow from "../row/row";

const meta: Meta<typeof LeaderboardTable> = {
  title: "Modules/Leaderboard/Table",
  component: LeaderboardTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardTable>;

const data = [
  {
    name: "bal7hazar",
    points: 950,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 900,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 820,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 800,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 800,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 790,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 775,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 720,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 700,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 690,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 670,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 650,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 650,
    highlight: false,
    following: false,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
    following: true,
  },
  {
    name: "player",
    points: 640,
    highlight: false,
    following: false,
  },
  {
    name: "shinobi",
    points: 640,
    highlight: true,
    following: false,
  },
];
Array.from({ length: 100 }).forEach((_, index) => {
  data.push({
    name: `player ${index}`,
    points: 640,
    highlight: false,
    following: false,
  });
});

export const Default: Story = {
  render: () => (
    <LeaderboardTable className="h-[657px]">
      {data.map((item, index) => (
        <LeaderboardTableRow
          key={index}
          rank={index + 1}
          name={item.name}
          points={item.points}
          highlight={item.highlight}
          following={item.following}
        />
      ))}
    </LeaderboardTable>
  ),
};
