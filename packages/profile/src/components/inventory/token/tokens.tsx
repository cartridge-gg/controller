import { Card, CardContent, CardHeader, CardTitle } from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { useCountervalue, useEkuboMetadata } from "@cartridge/utils";
import { formatEther } from "viem";
import { useBalances } from "@/hooks/token";
import { Balance, TokenPair } from "@cartridge/utils/api/cartridge";
import { getChecksumAddress } from "starknet";

export function Tokens() {
  // const { isVisible } = useConnection();
  // const { username } = useAccount();
  // const credit = useCreditBalance({
  //   username,
  //   interval: isVisible ? 3000 : undefined,
  // });
  const balancesQuery = useBalances();

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

      {balancesQuery.data?.balances.edges.map(({ node }) => (
        <Link
          key={node.meta.contractAddress}
          to={`token/${node.meta.contractAddress}`}
        >
          <TokenCardContent balance={node} />
        </Link>
      ))}
    </Card>
  );
}

function TokenCardContent({ balance }: { balance: Balance }) {
  const { countervalue } = useCountervalue({
    balance: formatEther(BigInt(balance.raw) || 0n),
    pair: `${balance.meta.symbol}_USDC` as TokenPair,
  });
  const ekuboMetaList = useEkuboMetadata();
  const ekuboMeta = ekuboMetaList.find(
    (m) =>
      getChecksumAddress(m.l2_token_address) ===
      getChecksumAddress(balance.meta.contractAddress),
  );

  return (
    <CardContent className="bg-background flex items-center p-0 h-full gap-px">
      <div className="bg-secondary flex h-full aspect-square items-center justify-center">
        <img
          src={ekuboMeta?.logo_url ?? "/public/placeholder.svg"}
          className="w-5 h-5"
        />
      </div>

      <div className="bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3 text-medium">
        <div className="flex items-center gap-2">
          <div>{balance.amount}</div>
          <div className="text-muted-foreground">{balance.meta.symbol}</div>
        </div>

        {countervalue && (
          <div className="text-muted-foreground">{countervalue.formatted}</div>
        )}
      </div>
    </CardContent>
  );
}
