import type { Meta, StoryObj } from "@storybook/react";

import { Upgrade } from "./Upgrade";
import Controller from "@/utils/controller";
import { constants } from "starknet";

const meta = {
  component: Upgrade,
  parameters: {
    connection: {
      controller: {
        username: () => "Account 1",
        chainId: () => constants.StarknetChainId.SN_MAIN,
      } as Partial<Controller>,
      upgrade: {
        latest: {
          changes: ["Update 1", "Update 2", "Update 3"],
        },
      },
    },
  },
} satisfies Meta<typeof Upgrade>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
