import type { Meta, StoryObj } from "@storybook/react";
import { TokenSelect } from "./token-select";

const mockTokens = [
  {
    balance: {
      amount: 0.000071521921165994,
      value: 0.12851233577956853,
      change: -0.0003482251426370486,
    },
    metadata: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      address:
        "0x049D36570D4e46f48e99674bd3fcc84644DdD6c96F7C741B1562B82f9e004dC7",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
    },
  },
  {
    balance: {
      amount: 53.123192130319154,
      value: 8.13288294077193,
      change: -0.09488246890479779,
    },
    metadata: {
      name: "Starknet Token",
      symbol: "STRK",
      decimals: 18,
      address:
        "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5dD61D6Ab07201858f4287c938D",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
    },
  },
  {
    balance: {
      amount: 0.1,
      value: 1e-13,
      change: 0,
    },
    metadata: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address:
        "0x053C91253BC9682c04929cA02ED00b3E423f6720D2ee7e0D5EBB06F3eCF368A8",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
    },
  },
  {
    balance: {
      amount: 0,
      value: 0,
      change: 0,
    },
    metadata: {
      name: "Dai Stablecoin",
      symbol: "DAI",
      decimals: 18,
      address:
        "0x00dA114221cb83fa859DBdb4C44bEeaa0BB37C8537ad5ae66Fe5e0efD20E6eB3",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/919e761b-56f7-4f53-32aa-5e066f7f6200/logo",
    },
  },
  {
    balance: {
      amount: 0,
      value: 0,
      change: 0,
    },
    metadata: {
      name: "Lords",
      symbol: "LORDS",
      decimals: 18,
      address:
        "0x0124aeb495b947201f5fac96fd1138e326ad86295b98df6dec9009158a533b49",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    },
  },
  {
    balance: {
      amount: 0,
      value: 0,
      change: 0,
    },
    metadata: {
      name: "Nums",
      symbol: "NUMS",
      decimals: 18,
      address:
        "0x00e5f10eddc01699dc899a30dbc3c9858148fa5aa0a47c0ffd85f887ffc4653e",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/90868d05-cb75-4c42-278c-5a540db2cf00/logo",
    },
  },
  {
    balance: {
      amount: 1275,
      value: 0,
      change: 0,
    },
    metadata: {
      name: "Paper",
      symbol: "PAPER",
      decimals: 18,
      address:
        "0x0410466536b5ae074f7fea81e5533b8134a9fa18b3dd077dd9db08f64997d113",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/811f019a-0461-4cff-6c1e-442102863f00/logo",
    },
  },
];

const meta: Meta<typeof TokenSelect> = {
  title: "Modules/ERC20/Token Select",
  component: TokenSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    tokens: mockTokens,
  },
};

export default meta;
type Story = StoryObj<typeof TokenSelect>;

export const Default: Story = {};
