import type { Meta, StoryObj } from "@storybook/react";
import { constants, shortString } from "starknet";
import { CreateSession } from "./CreateSession";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/controller-ui/utils";
import { parseSessionPolicies } from "@/hooks/session";
import type { SessionChainPolicies } from "@/hooks/connection";

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
                // amount: "0xffffffffffffffffffffffffffffffff",
                amount: "5000000000000000000", // 5 ETH
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

// Multichain approval: a settlement chain + an appchain covered by a single
// approval screen (SDK `multichainSessions` opt-in).
const gameContractPolicies = (vrfAddress: string) => ({
  contracts: {
    "0x0726ff219937aeb721fe61449bfbe60be6abe4f9fd06e391ae0051ec20cc5da2": {
      name: "Game Actions",
      methods: [
        { name: "Pull Orb", entrypoint: "pull", description: "Pull an orb" },
        {
          name: "Cash Out",
          entrypoint: "cash_out",
          description: "Cash out and end the game",
        },
      ],
    },
    [vrfAddress]: {
      name: "VRF Provider",
      methods: [{ name: "Request Random", entrypoint: "request_random" }],
    },
  },
});

export const MultichainVerified: Story = {
  args: {
    policies: parseSessionPolicies({
      verified: true,
      policies: gameContractPolicies(
        "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F",
      ),
    }),
    chainPolicies: [
      {
        chainId: constants.StarknetChainId.SN_SEPOLIA,
        rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
        policies: parseSessionPolicies({
          verified: true,
          policies: gameContractPolicies(
            "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F",
          ),
        }),
      },
      {
        chainId: shortString.encodeShortString("CARTRIDGE_TESTNET"),
        rpcUrl: "https://api.cartridge.gg/x/gbomb/katana",
        policies: parseSessionPolicies({
          verified: true,
          policies: gameContractPolicies(
            "0x04da58da34ca055e21fdc1ea3e694b9ea88e1a0f0a5e0d9d3ca228cbf4de7490",
          ),
        }),
      },
    ],
    onConnect: () => {},
  },
};

export const MultichainUnverified: Story = {
  args: {
    ...MultichainVerified.args,
    policies: parseSessionPolicies({
      verified: false,
      policies: gameContractPolicies(
        "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F",
      ),
    }),
    chainPolicies: (
      MultichainVerified.args!.chainPolicies as SessionChainPolicies
    ).map((chain) => ({
      ...chain,
      policies: { ...chain.policies, verified: false },
    })),
  },
};

export const WithPreset: Story = {
  parameters: {
    preset: "dope-wars",
  },
  args: {
    policies: parseSessionPolicies({
      verified: true,
      policies: {
        ...{
          contracts: {
            "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F":
              {
                name: "VRF Provider",
                description: "Provides verifiable random functions",
                methods: [
                  {
                    name: "Request Random",
                    description: "Request a random number",
                    entrypoint: "request_random",
                  },
                ],
              },
            "0x0410466536b5ae074f7fea81e5533b8134a9fa08b3dd077dd9db08f64997d113":
              {
                name: "Paper Token",
                description: "Manages paper approvals",
                methods: [
                  {
                    name: "Approve",
                    description: "Approve paper usage",
                    entrypoint: "approve",
                    amount: "0xffffffffffffffffffffffffffffffff",
                  },
                ],
              },
            "0x044a23BbfE03FFe90D3C23Fb6e5A8AD0341036C039363DfA6F3513278Aa51fCA":
              {
                name: "Game Contract",
                description: "Core game mechanics",
                methods: [
                  {
                    name: "Create Game",
                    description: "Start a new game",
                    entrypoint: "create_game",
                  },
                  {
                    name: "Travel",
                    description: "Travel to a new location",
                    entrypoint: "travel",
                  },
                  {
                    name: "Decide",
                    description: "Make a game decision",
                    entrypoint: "decide",
                  },
                  {
                    name: "End Game",
                    description: "End the current game",
                    entrypoint: "end_game",
                  },
                ],
              },
            "0x0412445e644070C69fEa16b964cC81Cd6dEBF6A4DBf683E2E9686a45ad088de8":
              {
                name: "Laundromat Contract",
                description: "Manages game scoring and laundering",
                methods: [
                  {
                    name: "Register Score",
                    description: "Register a game score",
                    entrypoint: "register_score",
                  },
                  {
                    name: "Claim",
                    description: "Claim rewards",
                    entrypoint: "claim",
                  },
                  {
                    name: "Launder",
                    description: "Launder resources",
                    entrypoint: "launder",
                  },
                ],
              },
          },
        },
        messages,
      },
    }),
    onConnect: () => {},
  },
};
