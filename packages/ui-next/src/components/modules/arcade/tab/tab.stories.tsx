import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeTab } from "./tab";
import { SparklesIcon } from "@/components/icons";
import { Tabs, TabsList } from "@/index";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Tabs className="p-0" defaultValue="assets">
    <TabsList className="p-0">{children}</TabsList>
  </Tabs>
);

const meta: Meta<typeof ArcadeTab> = {
  title: "Modules/Arcade/Tab",
  component: ArcadeTab,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeTab>;

export const Default: Story = {
  render: () => (
    <Wrapper>
      <ArcadeTab
        Icon={<SparklesIcon variant="solid" size="default" />}
        value="assets"
        label="Assets"
        variant="default"
      />
    </Wrapper>
  ),
};

export const Active: Story = {
  render: () => (
    <Wrapper>
      <ArcadeTab
        Icon={<SparklesIcon variant="solid" size="default" />}
        value="assets"
        label="Assets"
        active
        variant="default"
      />
    </Wrapper>
  ),
};
