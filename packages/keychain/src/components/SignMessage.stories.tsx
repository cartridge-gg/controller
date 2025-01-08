import type { Meta, StoryObj } from "@storybook/react";

import { SignMessage } from "./SignMessage";

const meta = {
  component: SignMessage,
} satisfies Meta<typeof SignMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    origin: "https://cartridge.gg",
    typedData: {
      types: {
        StarknetDomain: [
          {
            name: "name",
            type: "shortstring",
          },
          {
            name: "version",
            type: "shortstring",
          },
          {
            name: "chainId",
            type: "shortstring",
          },
          {
            name: "revision",
            type: "shortstring",
          },
        ],
        Person: [
          {
            name: "name",
            type: "felt",
          },
          {
            name: "wallet",
            type: "felt",
          },
        ],
        Mail: [
          {
            name: "from",
            type: "Person",
          },
          {
            name: "to",
            type: "Person",
          },
          {
            name: "contents",
            type: "felt",
          },
        ],
      },
      primaryType: "Mail",
      domain: {
        name: "StarkNet Mail",
        version: "1",
        revision: "1",
        chainId: "SN_SEPOLIA",
      },
      message: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    },
    onSign: () => {},
    onCancel: () => {},
  },
};
