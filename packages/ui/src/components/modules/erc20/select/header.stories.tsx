import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  TokenSelectRow,
  TokenSelectHeader,
} from "@/index";

const mockToken = {
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
};

const meta: Meta<typeof TokenSelectHeader> = {
  title: "Modules/ERC20/Token Select/Header",
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
    const currentToken = mockToken;
    return (
      <Select
        defaultValue={mockToken.metadata.address}
        value={mockToken.metadata.address}
      >
        <TokenSelectHeader onClick={() => {}} />
        <SelectContent className="invisible">
          {[mockToken].map((token) => (
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

export const Disabled: Story = {
  render: () => {
    const currentToken = mockToken;
    return (
      <Select
        defaultValue={mockToken.metadata.address}
        value={mockToken.metadata.address}
      >
        <TokenSelectHeader disabled={true} />
        <SelectContent className="invisible">
          {[mockToken].map((token) => (
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
