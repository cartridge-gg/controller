import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { Balance, ERC20Metadata, useCountervalue, useTokens } from "@cartridge/utils";
import { formatEther } from "viem";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { formatBalance } from "./helper";

export function Tokens() {
  // const { isVisible } = useConnection();
  // const { username } = useAccount();
  // const credit = useCreditBalance({
  //   username,
  //   interval: isVisible ? 3000 : undefined,
  // });
  const erc20 = useTokens();

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
        {erc20.data.map((t) => (
          <TokenCardContent token={t} key={t.meta.address} />
        ))}
      </CardListContent>
    </Card>
  );
}

function TokenCardContent({
  token,
}: {
  token: { balance: Balance; meta: ERC20Metadata };
}) {
  const { countervalue } = useCountervalue({
    balance: formatEther(token.balance.value || 0n),
    pair: `${token.meta.symbol}_USDC` as TokenPair,
  });

  return (
    <Link to={`token/${token.meta.address}`}>
      <CardListItem
        icon={token.meta.logoUrl ?? "/public/placeholder.svg"}
        className="hover:opacity-80"
      >
        <div className="flex items-center gap-2">
          {formatBalance(token.balance.formatted, ["~"])}
          <span className="text-foreground-400">{token.meta.symbol}</span>
        </div>

        {countervalue && (
          <div className="text-foreground-400">
            {formatBalance(countervalue.formatted, ["~"])}
          </div>
        )}
      </CardListItem>
    </Link>
  );
}
