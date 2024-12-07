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

export const WithPreset: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    policies: {
      verified: true,
      contracts: {
        "0xdeadbeef": {
          methods: [
            {
              name: "Approve Token",
              entrypoint: "approve",
              description: "Approve",
            },
            {
              name: "Transfer Money",
              entrypoint: "transfer",
              description: "Transfer",
            },
          ],
        },
        "0xdeafcafe": {
          methods: [
            {
              name: "Attack Eneemy",
              entrypoint: "attack",
              description: "Attack",
            },
            {
              name: "Defend Position",
              entrypoint: "defend",
              description: "Define",
            },
          ],
        },
      },
    },
    onConnect: () => {},
  },
};
