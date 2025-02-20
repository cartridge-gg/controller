import type { Meta, StoryObj } from "@storybook/react";
import { tokensBySymbol } from "@cartridge/utils/mock/data";
import { SendToken } from "./index";

const meta = {
  component: SendToken,
  parameters: {
    router: {
      params: {
        address: tokensBySymbol.ETH.address,
      },
    },
  },
} satisfies Meta<typeof SendToken>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
