import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeTabItem } from "./tab-item";
import { DotsIcon, SparklesIcon, SwordsIcon } from "@/components/icons";
import { Select, SelectContent, SelectTrigger, Tabs, TabsList } from "@/index";

const Wrapper = ({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) => (
  <Tabs className="p-0" defaultValue={defaultValue}>
    <TabsList className="p-0 h-8">
      <Select defaultValue={defaultValue}>
        <SelectTrigger className="p-2 w-8 h-8 flex items-center justify-center">
          <DotsIcon size="xs" />
        </SelectTrigger>
        <SelectContent className="p-0 flex flex-col gap-2 items-stretch">
          {children}
        </SelectContent>
      </Select>
    </TabsList>
  </Tabs>
);

const meta: Meta<typeof ArcadeTabItem> = {
  title: "Modules/Arcade/Tab Item",
  component: ArcadeTabItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeTabItem>;

export const Default: Story = {
  render: () => (
    <Wrapper defaultValue="assets">
      <ArcadeTabItem
        Icon={<SparklesIcon variant="solid" size="sm" />}
        value="assets"
        label="Assets"
        active
        variant="default"
      />
      <ArcadeTabItem
        Icon={<SwordsIcon variant="solid" size="sm" />}
        value="other"
        label="Other"
        variant="default"
      />
    </Wrapper>
  ),
};
