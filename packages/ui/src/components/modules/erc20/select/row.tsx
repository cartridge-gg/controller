import { SelectItem, Thumbnail } from "@/index";
import { cn } from "@/utils";
import { Token } from "./token-select";

export const TokenSelectRow = ({
  className,
  token,
  currentToken,
}: {
  className?: string;
  token: Token;
  currentToken: Token;
}) => {
  return (
    <SelectItem
      simplified
      value={token.metadata.address}
      data-active={token.metadata.address === currentToken.metadata.address}
      className={cn(
        "group hover:bg-background-300 hover:text-foreground-100 border-b border-border cursor-pointer data-[active=true]:bg-background-200 data-[active=true]:hover:bg-background-300 data-[active=true]:text-foreground-100 rounded-none",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {token.metadata.image ? (
          <Thumbnail
            icon={token.metadata.image}
            rounded
            size="sm"
            variant="light"
            className="group-hover:bg-background-400"
          />
        ) : (
          <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
        )}
        <span className="font-medium text-sm">{token.metadata.symbol}</span>
      </div>
    </SelectItem>
  );
};
