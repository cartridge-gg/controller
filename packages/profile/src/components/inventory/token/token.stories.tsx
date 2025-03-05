import type { Meta, StoryObj } from "@storybook/react";
import { tokensBySymbol } from "@cartridge/utils/mock/data";
import { Token } from "./token";

const meta = {
  component: Token,
  parameters: {
    router: {
      params: {
        address: tokensBySymbol.ETH.address,
      },
    },
  },
} satisfies Meta<typeof Token>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
