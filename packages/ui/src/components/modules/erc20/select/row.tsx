import { SelectItem, Thumbnail } from "@/index";
import { cn } from "@/utils";
import { Token } from "./token-select";

export const TokenSelectRow = ({
  className,
  token,
}: {
  className?: string;
  token: Token;
  currentToken?: Token;
}) => {
  return (
    <SelectItem
      value={token.metadata.address}
      className={cn("cursor-pointer", className)}
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
