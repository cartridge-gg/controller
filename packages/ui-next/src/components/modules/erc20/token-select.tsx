import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import { CaratIcon, Thumbnail } from "@/index";

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
}: TokenSelectProps) => {
  const token = defaultToken || tokens[0];

  const handleChangeToken = (address: string) => {
    const selectedToken = tokens.find(
      (token) => token.metadata.address === address,
    );
    if (selectedToken) {
      onSelect(selectedToken);
    }
  };

  return (
    <Select
      onValueChange={handleChangeToken}
      defaultValue={token.metadata.address}
    >
      <SelectTrigger className="w-fit rounded-full">
        <SelectValue placeholder="Select Token" />
        <CaratIcon variant="down" className="text-foreground-300" />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem
            simplified
            key={token.metadata.address}
            value={token.metadata.address}
            className="hover:bg-background-300 hover:text-foreground-100 border-b border-border"
          >
            <div className="flex items-center gap-2">
              {token.metadata.image ? (
                <Thumbnail
                  icon={token.metadata.image}
                  rounded
                  size="sm"
                  variant="light"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
              )}
              <span className="font-semibold text-sm/5">
                {token.metadata.symbol}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
