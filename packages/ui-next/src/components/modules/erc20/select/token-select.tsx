import { Select, SelectContent } from "@/components/primitives/select";
import { useState } from "react";
import { TokenSelectHeader } from "./header";
import { TokenSelectRow } from "./row";
import { cn } from "@/utils";

export type Balance = {
  amount: number;
  value: number;
  change: number;
};

export type ERC20Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  image: string | undefined;
};

export type Token = {
  balance: Balance;
  metadata: ERC20Metadata;
};

interface TokenSelectProps {
  tokens: Token[];
  defaultToken?: Token;
  onSelect: (token: Token) => void;
}

export const TokenSelect = ({
  tokens,
  defaultToken,
  onSelect,
  ...props
}: TokenSelectProps & React.ComponentProps<typeof Select>) => {
  const [currentToken, setCurrentToken] = useState<Token>(
    defaultToken || tokens[0],
  );

  const handleChangeToken = (address: string) => {
    const selectedToken = tokens.find(
      (token) => token.metadata.address === address,
    );
    if (selectedToken) {
      onSelect(selectedToken);
      setCurrentToken(selectedToken);
    }
  };

  return (
    <Select
      {...props}
      value={currentToken.metadata.address}
      onValueChange={handleChangeToken}
      defaultValue={currentToken.metadata.address}
    >
      <TokenSelectHeader />
      <SelectContent viewPortClassName="gap-0">
        {tokens.map((token, i) => (
          <TokenSelectRow
            key={token.metadata.address}
            token={token}
            currentToken={currentToken}
            className={cn(i === tokens.length - 1 && "border-b-0")}
          />
        ))}
      </SelectContent>
    </Select>
  );
};
