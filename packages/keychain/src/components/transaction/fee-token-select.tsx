import {
  Select,
  SelectContent,
  TokenSelectHeader,
  TokenSelectRow,
  cn,
} from "@cartridge/ui-next";
import { useEffect, useState } from "react";

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
  headerClassName?: string;
}

export const FeeTokenSelect = ({
  tokens,
  defaultToken,
  onSelect,
  headerClassName,
  ...props
}: TokenSelectProps & React.ComponentProps<typeof Select>) => {
  const [currentToken, setCurrentToken] = useState<Token>(
    defaultToken || tokens[0],
  );

  useEffect(() => {
    if (defaultToken) {
      setCurrentToken(defaultToken);
    }
  }, [defaultToken]);

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
      <TokenSelectHeader
        className={cn("rounded disabled:bg-background-200", headerClassName)}
      />
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
