import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleTabs } from "./tabs";
import { TabsContent } from "@/index";

const meta: Meta<typeof CollectibleTabs> = {
  title: "Modules/Collectibles/Tabs",
  component: CollectibleTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleTabs>;

export const Default: Story = {
  render: () => (
    <CollectibleTabs order={["details", "items", "activity"]}>
      <TabsContent className="p-0 mt-0" value="details">
        <h1 className="text-foreground-100 p-4">Details content</h1>
      </TabsContent>
      <TabsContent className="p-0 mt-0" value="items">
        <h1 className="text-foreground-100 p-4">Items content</h1>
      </TabsContent>
      <TabsContent className="p-0 mt-0" value="activity">
        <h1 className="text-foreground-100 p-4">Activity content</h1>
      </TabsContent>
    </CollectibleTabs>
  ),
};
