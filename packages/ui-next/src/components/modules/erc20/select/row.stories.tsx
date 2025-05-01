import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  TokenSelectRow,
  TokenSelectHeader,
} from "@/index";

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
];

const meta: Meta<typeof TokenSelectHeader> = {
  title: "Modules/ERC20/Token Select/Row",
  component: TokenSelectHeader,
  parameters: {
    layout: "centered",
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof TokenSelectHeader>;

export const Default: Story = {
  render: () => {
    const currentToken = mockTokens[0];
    return (
      <Select
        defaultValue={currentToken.metadata.address}
        value={currentToken.metadata.address}
        defaultOpen={true}
      >
        <TokenSelectHeader className="invisible" />
        <SelectContent>
          {mockTokens.map((token) => (
            <TokenSelectRow
              key={token.metadata.address}
              token={token}
              currentToken={currentToken}
            />
          ))}
        </SelectContent>
      </Select>
    );
  },
};
