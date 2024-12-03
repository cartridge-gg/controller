import type { Meta, StoryObj } from "@storybook/react";
import { CreateSession } from "./CreateSession";

const meta: Meta<typeof CreateSession> = {
  component: CreateSession,
  parameters: {
    connection: {
      upgrade: {
        isSynced: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onConnect: () => {},
  },
};

export const WithTheme: Story = {
  parameters: {
    preset: "loot-survivor",
  },
  args: {
    onConnect: () => {},
  },
};
