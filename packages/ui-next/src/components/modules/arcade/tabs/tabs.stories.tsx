import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeTabs } from "./tabs";

const meta: Meta<typeof ArcadeTabs> = {
  title: "Modules/Arcade/Tabs",
  component: ArcadeTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    discover: true,
    inventory: true,
    achievements: true,
    guilds: true,
    activity: true,
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeTabs>;

export const Default: Story = {};
