import type { Meta, StoryObj } from "@storybook/react";
import { Upgrade } from "./Upgrade";
import {
  useUpgrade,
  createMockUpgrade,
} from "#components/provider/upgrade.mock";
import { createMockConnection } from "#hooks/connection.mock";
import { useConnection } from "#hooks/connection.mock";

const meta = {
  component: Upgrade,
  beforeEach: () => {
    useUpgrade.mockReturnValue(
      createMockUpgrade({
        latest: {
          changes: ["Update 1", "Update 2", "Update 3"],
        },
      }),
    );
    useConnection.mockReturnValue(
      createMockConnection({
        controller: {
          username: () => "Account 1",
        },
      }),
    );
  },
} satisfies Meta<typeof Upgrade>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
