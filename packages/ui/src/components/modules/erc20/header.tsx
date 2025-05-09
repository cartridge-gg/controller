import { Skeleton, Thumbnail } from "@/index";
import { ERC20Token } from "./types";

export const ERC20Header = ({ token }: { token: ERC20Token }) => {
  return (
    <div className="flex items-center gap-4">
      <Thumbnail icon={token.metadata.image} size="lg" rounded />
      <div className="flex flex-col gap-0.5">
        {token.balance === undefined ? (
          <Skeleton className="h-[20px] w-[120px] rounded" />
        ) : (
          <p className="text-semibold text-lg/[22px]">
            {`${token.balance.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.metadata.symbol}`}
          </p>
        )}
        {!!token.balance.value && (
          <p className="text-foreground-300 text-xs">
            {`$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          </p>
        )}
      </div>
    </div>
  );
};
