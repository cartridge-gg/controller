import type { Meta, StoryObj } from "@storybook/react";
import { FollowerTab } from "./tab";
import { Tabs, TabsList } from "@/index";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Tabs defaultValue="followers">
    <TabsList className="h-auto grid w-full grid-cols-2 gap-x-4 bg-transparent p-0">
      {children}
    </TabsList>
  </Tabs>
);

const meta: Meta<typeof FollowerTab> = {
  title: "Modules/Followers/Tab",
  component: FollowerTab,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: "followers",
    label: "Followers",
  },
};

export default meta;
type Story = StoryObj<typeof FollowerTab>;

export const Default: Story = {
  render: () => (
    <Wrapper>
      <FollowerTab value="followers" label="Followers" active counter={12} />
      <FollowerTab
        value="following"
        label="Following"
        active={false}
        counter={6}
      />
    </Wrapper>
  ),
};
