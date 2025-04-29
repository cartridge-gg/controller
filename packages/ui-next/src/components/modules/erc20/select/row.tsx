import { SelectItem, Thumbnail } from "@/index";
import { Token } from "./token-select";

export const TokenSelectRow = ({
  token,
  currentToken,
}: {
  token: Token;
  currentToken: Token;
}) => {
  return (
    <SelectItem
      simplified
      value={token.metadata.address}
      data-active={token.metadata.address === currentToken.metadata.address}
      className="hover:bg-background-300 hover:text-foreground-100 border-b border-border cursor-pointer data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100"
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
        <span className="font-medium text-sm">{token.metadata.symbol}</span>
      </div>
    </SelectItem>
  );
};
