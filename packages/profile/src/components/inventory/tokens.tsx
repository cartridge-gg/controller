import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SpinnerIcon,
  CoinsIcon,
} from "@cartridge/ui-next";
import { useAccount, useConnection } from "@/hooks/context";
import { Link } from "react-router-dom";
import {
  Balance,
  ERC20Metadata,
  useCreditBalance,
  useERC20Balance,
} from "@cartridge/utils";

export function Tokens() {
  const { isVisible, provider, erc20: contractAddress } = useConnection();
  const { address } = useAccount();
  const credit = useCreditBalance({
    address,
    interval: isVisible ? 3000 : null,
  });

  const { data: erc20 } = useERC20Balance({
    address,
    contractAddress,
    provider,
    interval: isVisible ? 3000 : undefined,
  });

  return (
    <Card>
      <CardHeader className="h-10 flex flex-row items-center justify-between">
        <CardTitle>Tokens</CardTitle>
        {credit.isFetching && <SpinnerIcon className="animate-spin" />}
      </CardHeader>

      <Link to={`/token/credit`}>
        <CardContent className="bg-background flex items-center p-0 h-full gap-0.5">
          <div className="bg-secondary flex h-full aspect-square items-center justify-center">
            <CoinsIcon variant="solid" size="sm" />
          </div>

          <div className="bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div>{credit.balance.formatted}</div>
              <div className="text-xs text-muted-foreground">CREDITS</div>
            </div>

            <div className="text-xs text-muted-foreground">
              ${credit.balance.formatted}
            </div>
          </div>
        </CardContent>
      </Link>

      {erc20.map((t) => (
        <Link key={t.meta.address} to={`/token/${t.meta.address}`}>
          <TokenCardContent token={t} />
        </Link>
      ))}
    </Card>
  );
}

function TokenCardContent({
  token,
}: {
  token: { balance: Balance; meta: ERC20Metadata };
}) {
  return (
    <CardContent className="bg-background flex items-center p-0 h-full gap-0.5">
      <div className="bg-secondary flex h-full aspect-square items-center justify-center">
        <img src={token.meta.logoUrl} className="w-5 h-5" />
      </div>

      <div className="bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div>{token.balance.formatted}</div>
          <div className="text-xs text-muted-foreground">
            {token.meta.symbol}
          </div>
        </div>

        {/* Disable countervalue for now */}
        {/* <div className="text-xs text-muted-foreground">$25.23</div> */}
      </div>
    </CardContent>
  );
}
