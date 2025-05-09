import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleTab } from "./tab";
import { BookIcon, PulseIcon, Tabs, TabsList } from "@/index";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Tabs defaultValue="collectibles">
    <TabsList className="h-auto grid w-full grid-cols-2 gap-x-4 bg-transparent p-0">
      {children}
    </TabsList>
  </Tabs>
);

const meta: Meta<typeof CollectibleTab> = {
  title: "Modules/Collectibles/Tab",
  component: CollectibleTab,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: "collectibles",
    label: "Collectibles",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleTab>;

export const Default: Story = {
  render: () => (
    <Wrapper>
      <CollectibleTab
        value="details"
        label="Details"
        active
        Icon={<BookIcon variant="solid" size="sm" />}
      />
      <CollectibleTab
        value="activity"
        label="Activity"
        active={false}
        Icon={<PulseIcon variant="solid" size="sm" />}
      />
    </Wrapper>
  ),
};
