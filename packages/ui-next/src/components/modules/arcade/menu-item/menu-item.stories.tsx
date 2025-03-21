import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeMenuItem } from "./menu-item";
import { SparklesIcon, SwordsIcon } from "@/components/icons";
import {
  ArcadeMenuButton,
  Select,
  SelectContent,
  Tabs,
  TabsList,
} from "@/index";

const meta: Meta<typeof ArcadeMenuItem> = {
  title: "Modules/Arcade/Menu Item",
  component: ArcadeMenuItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeMenuItem>;

export const Default: Story = {
  render: () => (
    <Tabs className="p-0" defaultValue="assets">
      <TabsList className="p-0 h-8">
        <Select defaultValue="assets">
          <ArcadeMenuButton />
          <SelectContent className="p-0 flex flex-col gap-2 items-stretch">
            <ArcadeMenuItem
              Icon={<SparklesIcon variant="solid" size="sm" />}
              value="assets"
              label="Assets"
              variant="default"
            />
            <ArcadeMenuItem
              Icon={<SwordsIcon variant="solid" size="sm" />}
              value="other"
              label="Other"
              variant="default"
            />
          </SelectContent>
        </Select>
      </TabsList>
    </Tabs>
  ),
};

export const Active: Story = {
  render: () => (
    <Tabs className="p-0" defaultValue="assets">
      <TabsList className="p-0 h-8">
        <Select defaultValue="assets">
          <ArcadeMenuButton active />
          <SelectContent className="p-0 flex flex-col gap-2 items-stretch">
            <ArcadeMenuItem
              Icon={<SparklesIcon variant="solid" size="sm" />}
              value="assets"
              label="Assets"
              active
              variant="default"
            />
            <ArcadeMenuItem
              Icon={<SwordsIcon variant="solid" size="sm" />}
              value="other"
              label="Other"
              variant="default"
            />
          </SelectContent>
        </Select>
      </TabsList>
    </Tabs>
  ),
};
