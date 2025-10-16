import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionSuccess } from "./ConnectionSuccess";

const meta: Meta<typeof ConnectionSuccess> = {
  title: "Components/ConnectionSuccess",
  component: ConnectionSuccess,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionSuccess>;

export const Default: Story = {};
