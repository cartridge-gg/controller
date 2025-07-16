import type { Meta, StoryObj } from "@storybook/react";

import { Authenticate } from "./index";
import { constants } from "starknet";

const meta = {
  component: Authenticate,
} satisfies Meta<typeof Authenticate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "account-1",
    network: constants.NetworkName.SN_MAIN,
    action: "login",
    appId: "app-1",
    onSuccess: () => {
      console.log("Success!");
    },
  },
};
