import type { Meta, StoryObj } from "@storybook/react";
import { Status } from "./status";

const meta = {
  title: "Modules/Settings/Status",
  component: Status,
  parameters: {
    layout: "centered",
  },
  args: {
    isActive: true,
  },
} satisfies Meta<typeof Status>;

export default meta;

type Story = StoryObj<typeof Status>;

export const Default: Story = {
  args: {
    isActive: true,
  },
};
