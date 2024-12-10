import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { useCountervalue } from "@cartridge/utils";
import { formatEther } from "viem";
import { useBalances } from "@/hooks/token";
import { Erc20BalancesQuery, TokenPair } from "@cartridge/utils/api/cartridge";
import { getChecksumAddress } from "starknet";
import { formatBalance } from "./helper";
import { erc20Metadata } from "@cartridge/presets";

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
        <CardListItem icon={<CoinsIcon variant="solid" />} className="hover:opacity-80">
          <div className="flex items-center gap-2">
            {credit.balance.formatted}
            <span className="text-foreground-400">CREDITS</span>
          </div>
        </CardListItem>
      </Link> */}

      <CardListContent>
        {balancesQuery.data?.balances.edges.map(({ node }) => (
          <TokenCardContent balance={node} key={node.meta.contractAddress} />
        ))}
      </CardListContent>
    </Card>
  );
}

function TokenCardContent({
  balance,
}: {
  balance: Erc20BalancesQuery["balances"]["edges"][0]["node"];
}) {
  const { countervalue } = useCountervalue({
    balance: formatEther(BigInt(balance.raw) || 0n),
    pair: `${balance.meta.symbol}_USDC` as TokenPair,
  });
  const ekuboMeta = erc20Metadata.find(
    (m) =>
      getChecksumAddress(m.l2_token_address) ===
      getChecksumAddress(balance.meta.contractAddress),
  );

  return (
    <Link to={`token/${balance.meta.contractAddress}`}>
      <CardListItem
        icon={ekuboMeta?.logo_url ?? "/public/placeholder.svg"}
        className="hover:opacity-80"
      >
        <div className="flex items-center gap-2">
          {formatBalance(balance.amount.toString(), ["~"])}
          <span className="text-foreground-400">{balance.meta.symbol}</span>
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
