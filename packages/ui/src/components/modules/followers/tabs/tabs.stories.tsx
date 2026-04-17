import type { Meta, StoryObj } from "@storybook/react";
import { FollowerTabs } from "./tabs";
import { TabsContent } from "@/index";

const meta: Meta<typeof FollowerTabs> = {
  title: "Modules/Followers/Tabs",
  component: FollowerTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof FollowerTabs>;

export const Default: Story = {
  render: () => (
    <FollowerTabs defaultValue="followers" followers={12} following={6}>
      <TabsContent className="p-0 mt-0" value="followers">
        <h1 className="text-foreground-100 p-4">Followers content</h1>
      </TabsContent>
      <TabsContent className="p-0 mt-0" value="following">
        <h1 className="text-foreground-100 p-4">Following content</h1>
      </TabsContent>
    </FollowerTabs>
  ),
};
