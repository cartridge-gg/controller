import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeDiscoveryEvent } from "./discovery-event";

const meta: Meta<typeof ArcadeDiscoveryEvent> = {
  title: "Modules/Arcade/Discovery Event",
  component: ArcadeDiscoveryEvent,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    name: "bal7hazar",
    achievement: {
      title: "Squire",
      icon: "fa-seedling",
    },
    timestamp: 1740388686,
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeDiscoveryEvent>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
