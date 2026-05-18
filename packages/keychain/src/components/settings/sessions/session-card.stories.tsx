import { DesktopIcon } from "@cartridge/controller-ui";
import type { Meta, StoryObj } from "@storybook/react";
import { SessionCard } from "./session-card";

const meta = {
  title: "components/settings/Session Card",
  component: SessionCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    icon: <DesktopIcon variant="solid" size="sm" />,
    name: "example.cartridge.gg",
    rightText: "5d",
    onDelete: async () => {
      console.log("Delete session");
    },
  },
} satisfies Meta<typeof SessionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
