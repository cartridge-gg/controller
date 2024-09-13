import { Meta, StoryObj } from "@storybook/react";
import { Login } from "./Login";
import { constants } from "starknet";

const meta = {
  component: Login,
  parameters: {
    connection: {
      chainId: constants.StarknetChainId.SN_MAIN as string,
    },
  },
  argTypes: {},
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {
  args: {
    onSignup: () => {},
  },
};
