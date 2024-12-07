import type { Meta, StoryObj } from "@storybook/react";
import { CreateSession } from "./CreateSession";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";
import { parseSessionPolicies } from "hooks/session";
import { controllerConfigs } from "@cartridge/presets";

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
    policies: parseSessionPolicies({
      verified: false,
      policies: {
        contracts: {
          [ETH_CONTRACT_ADDRESS]: {
            methods: [
              {
                name: "Approve",
                entrypoint: "approve",
                description:
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
              },
              {
                name: "Transfer",
                entrypoint: "transfer",
              },
              {
                name: "Mint",
                entrypoint: "mint",
              },
              {
                name: "Burn",
                entrypoint: "burn",
              },
              {
                name: "Allowance",
                entrypoint: "allowance",
              },
            ],
          },
        },
      },
    }),
    onConnect: () => {},
  },
};

export const WithPreset: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    policies: parseSessionPolicies({
      verified: true,
      policies: controllerConfigs["eternum"].policies!,
    }),
    onConnect: () => {},
  },
};
