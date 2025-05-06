import type { Meta, StoryObj } from "@storybook/react";
import { FollowerSocialList } from "./social-list";
import FollowerSocialRow from "../social-row/social-row";
import { fn } from "@storybook/test";

const meta: Meta<typeof FollowerSocialList> = {
  title: "Modules/Followers/Social List",
  component: FollowerSocialList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof FollowerSocialList>;

const followers = [
  {
    name: "bal7hazar",
    points: 950,
    following: false,
  },
  {
    name: "player",
    points: 900,
    following: true,
  },
  {
    name: "player",
    points: 820,
    following: false,
  },
  {
    name: "player",
    points: 800,
    following: false,
  },
  {
    name: "player",
    points: 800,
    following: false,
  },
  {
    name: "player",
    points: 790,
    following: false,
  },
  {
    name: "player",
    points: 775,
    following: true,
  },
  {
    name: "player",
    points: 720,
    following: false,
  },
  {
    name: "player",
    points: 700,
    following: false,
  },
  {
    name: "player",
    points: 690,
    following: true,
  },
  {
    name: "player",
    points: 670,
    following: true,
  },
  {
    name: "player",
    points: 650,
    following: false,
  },
  {
    name: "player",
    points: 650,
    following: true,
  },
  {
    name: "player",
    points: 640,
    following: false,
  },
  {
    name: "player",
    points: 640,
    following: true,
  },
  {
    name: "player",
    points: 640,
    following: true,
  },
  {
    name: "player",
    points: 640,
    following: false,
  },
  {
    name: "shinobi",
    points: 640,
    following: true,
  },
];

export const Followers: Story = {
  render: () => (
    <FollowerSocialList className="h-[600px]">
      {followers.map((item, index) => (
        <FollowerSocialRow
          key={index}
          username={item.name}
          points={item.points}
          following={item.following}
          unfollowable={false}
          disabled={index === 3}
          loading={index === 6}
          onSocialClick={fn()}
        />
      ))}
    </FollowerSocialList>
  ),
};

export const Following: Story = {
  render: () => (
    <FollowerSocialList className="h-[600px]">
      {followers.map((item, index) => (
        <FollowerSocialRow
          key={index}
          username={item.name}
          points={item.points}
          following={true}
          unfollowable={true}
          disabled={index === 3}
          loading={index === 6}
          onSocialClick={fn()}
        />
      ))}
    </FollowerSocialList>
  ),
};
