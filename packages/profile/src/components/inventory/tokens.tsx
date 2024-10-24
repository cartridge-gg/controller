import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SpinnerIcon,
  CoinsIcon,
} from "@cartridge/ui-next";
import { useAccount } from "@/hooks/context";
import { Link } from "react-router-dom";

export function Tokens() {
  const { credit, erc20, isFetching } = useAccount();

  return (
    <Card>
      <CardHeader className="h-10 flex flex-row items-center justify-between">
        <CardTitle>Token</CardTitle>
        {isFetching && <SpinnerIcon className="animate-spin" />}
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
        <Link key={t.address} to={`/token/${t.address}`}>
          <CardContent
            key={t.address + i}
            className="flex items-center justify-between"
          >
            <div className="flex gap-x-1.5 items-center">
              <img src={t.logoUrl} className="w-5 h-5" />
              <div>{t.balance.formatted}</div>
              {/* <div>{formatBalance(BigInt(t.balance ?? 0))}</div> */}
            </div>
            <div className="text-xs text-muted-foreground">{t.symbol}</div>
          </CardContent>
        </Link>
      ))}
    </Card>
  );
}
