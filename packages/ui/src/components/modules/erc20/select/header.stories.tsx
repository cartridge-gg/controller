import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  TokenSelectRow,
  TokenSelectHeader,
} from "@/index";
import { mockTokens } from "./row.stories";

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
    const currentToken = mockTokens[0];
    return (
      <Select
        defaultValue={currentToken.metadata.address}
        value={currentToken.metadata.address}
      >
        <TokenSelectHeader onClick={() => {}} />
        <SelectContent className="invisible">
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

export const Disabled: Story = {
  render: () => {
    const currentToken = mockTokens[0];
    return (
      <Select
        defaultValue={currentToken.metadata.address}
        value={currentToken.metadata.address}
      >
        <TokenSelectHeader disabled={true} />
        <SelectContent className="invisible">
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
