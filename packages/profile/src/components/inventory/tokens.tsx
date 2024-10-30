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
import { useCreditBalance, useERC20Balance } from "@cartridge/utils";

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
        <CardTitle>Token</CardTitle>
        {credit.isFetching && <SpinnerIcon className="animate-spin" />}
      </CardHeader>

      <Link to={`/token/credit`}>
        <CardContent className="flex items-center justify-between">
          <div className="flex gap-x-1.5 items-center">
            <CoinsIcon variant="solid" size="sm" />
            <div>{credit.balance.formatted}</div>
            <div className="text-muted-foreground">
              ${credit.balance.formatted}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">CREDITS</div>
        </CardContent>
      </Link>

      {erc20.map((t, i) => (
        <Link key={t.meta.address} to={`/token/${t.meta.address}`}>
          <CardContent
            key={t.meta.address + i}
            className="flex items-center justify-between"
          >
            <div className="flex gap-x-1.5 items-center">
              <img src={t.meta.logoUrl} className="w-5 h-5" />
              <div>{t.balance.formatted}</div>
            </div>
            <div className="text-xs text-muted-foreground">{t.meta.symbol}</div>
          </CardContent>
        </Link>
      ))}
    </Card>
  );
}
