import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SpinnerIcon,
} from "@cartridge/ui-next";
import { useAccount } from "@/hooks/context";
import { Link } from "react-router-dom";

export function Tokens() {
  const { erc20, isFetching } = useAccount();

  return (
    <Card>
      <CardHeader className="h-10 flex flex-row items-center justify-between">
        <CardTitle>Token</CardTitle>
        {isFetching && <SpinnerIcon className="animate-spin" />}
      </CardHeader>

      {erc20.map((t, i) => (
        <Link key={t.address} to={`/token/${t.address}`}>
          <CardContent
            key={t.address + i}
            className="flex gap-x-1.5 items-center"
          >
            <img src={t.logoUrl} className="w-5 h-5" />
            <div>
              {t.balance === undefined ? "---" : t.balance.toString()}{" "}
              {t.symbol}
            </div>
          </CardContent>
        </Link>
      ))}
    </Card>
  );
}
