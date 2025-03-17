import type { Meta, StoryObj } from "@storybook/react";
import { CreateSession } from "./CreateSession";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";
import { parseSessionPolicies } from "@/hooks/session";
import { controllerConfigs } from "@cartridge/presets";

const meta: Meta<typeof CreateSession> = {
  component: CreateSession,
  parameters: {
    connection: {
      upgrade: {
        isSynced: true,
        available: false,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const messages = [
  {
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
      "eternum-Message": [
        {
          name: "identity",
          type: "ContractAddress",
        },
        {
          name: "channel",
          type: "shortstring",
        },
        {
          name: "content",
          type: "string",
        },
        {
          name: "timestamp",
          type: "felt",
        },
        {
          name: "salt",
          type: "felt",
        },
      ],
    },
    primaryType: "eternum-Message",
    domain: {
      name: "Eternum",
      version: "1",
      chainId: "SN_SEPOLIA",
      revision: "1",
    },
  },
];

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
          "0x047d88C65A627b38d728a783382Af648D79AED80Bf396047F9E839e8501d7F6D":
            {
              name: "Pillage",
              description: "Allows you raid a structure and pillage resources",
              methods: [
                {
                  name: "Battle Pillage",
                  description: "Pillage a structure",
                  entrypoint: "battle_pillage",
                },
              ],
            },
          "0x001cE27792b23cE379398F5468b69739e89314b2657Cfa3A9c388BDFD33DcFbf":
            {
              name: "Battle contract",
              description: "Required to engage in battles",
              methods: [
                {
                  name: "Battle Start",
                  description: "Start a battle",
                  entrypoint: "battle_start",
                  isRequired: true,
                },
                {
                  name: "Battle Force Start",
                  description: "Force start a battle",
                  entrypoint: "battle_force_start",
                },
                {
                  name: "Battle Join",
                  description: "Join a battle",
                  entrypoint: "battle_join",
                },
              ],
            },
          "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D":
            {
              name: "STRK Token",
              description: "Starknet token contract",
              methods: [
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
          "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F":
            {
              methods: [
                {
                  entrypoint: "request_random",
                },
              ],
            },
        },
        messages,
      },
    }),
    onConnect: () => {},
  },
};

export const WithPreset: Story = {
  parameters: {
    preset: "dope-wars",
  },
  args: {
    policies: parseSessionPolicies({
      verified: true,
      policies: { ...controllerConfigs["dope-wars"].policies!, messages },
    }),
    onConnect: () => {},
  },
};
