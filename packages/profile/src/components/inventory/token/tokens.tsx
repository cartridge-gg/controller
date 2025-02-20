import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import {
  useTokens,
  formatBalance,
  convertTokenAmountToUSD,
} from "@cartridge/utils";

export function Tokens() {
  // const { isVisible } = useConnection();
  // const { username } = useAccount();
  // const credit = useCreditBalance({
  //   username,
  //   interval: isVisible ? 3000 : undefined,
  // });
  const { tokens } = useTokens();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
      </CardHeader>

      {/* <Link to={`${location.pathname}/token/credit`} state={{ back: location.pathname }}>
        <CardListItem icon={<CoinsIcon variant="solid" />} className="hover:opacity-80">
          <div className="flex items-center gap-2">
            {credit.balance.formatted}
            <span className="text-foreground-400">CREDITS</span>
          </div>
        </CardListItem>
      </Link> */}

      <CardListContent>
        {Object.entries(tokens).map(([address, token]) => (
          <Link key={address} to={`token/${token.address}`}>
            <CardListItem
              icon={token.icon ?? "/public/placeholder.svg"}
              className="hover:opacity-80"
            >
              <div className="flex items-center gap-2">
                {token.balance !== undefined
                  ? formatBalance(token.balance)
                  : "..."}
                <span className="text-foreground-400">{token.symbol}</span>
              </div>

              {token?.balance !== undefined && token.price && (
                <div className="text-foreground-400">
                  {convertTokenAmountToUSD(token.balance, 18, token.price)}
                </div>
              )}
            </CardListItem>
          </Link>
        ))}
      </CardListContent>
    </Card>
  );
}
