import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { Balance, ERC20Metadata, useCountervalue } from "@cartridge/utils";
import { formatEther } from "viem";
import { useTokens } from "@/hooks/token";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { useState } from "react";

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
        <CardContent className="bg-background flex items-center p-0 h-full gap-px">
          <div className="bg-secondary flex h-full aspect-square items-center justify-center">
            <CoinsIcon variant="solid" size="sm" />
          </div>

          <div className="bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3 text-medium">
            <div className="flex items-center gap-2">
              <div>{credit.balance.formatted}</div>
              <div className="text-muted-foreground">CREDITS</div>
            </div>

            <div className="text-muted-foreground">
              ${credit.balance.formatted}
            </div>
          </div>
        </CardContent>
      </Link> */}

      {erc20.data.map((t) => (
        <Link key={t.meta.address} to={`token/${t.meta.address}`}>
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
  const [hover, setHover] = useState(false);
  const { countervalue } = useCountervalue({
    balance: formatEther(token.balance.value || 0n),
    pair: `${token.meta.symbol}_USDC` as TokenPair,
  });

  return (
    <CardContent
      className={cn(
        "bg-background flex items-center p-0 h-11 gap-px",
        hover && "opacity-80",
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="bg-secondary flex w-11 aspect-square items-center justify-center">
        <img
          src={token.meta.logoUrl ?? "/public/placeholder.svg"}
          className="w-5 h-5"
        />
      </div>

      <div className="bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3 text-medium">
        <div className="flex items-center gap-2">
          <div>{token.balance.formatted}</div>
          <div className="text-muted-foreground">{token.meta.symbol}</div>
        </div>

        {countervalue && (
          <div className="text-muted-foreground">{countervalue.formatted}</div>
        )}
      </div>
    </CardContent>
  );
}
