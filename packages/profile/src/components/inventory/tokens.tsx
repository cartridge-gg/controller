import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SpinnerIcon,
} from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import {
  Balance,
  ERC20Metadata,
  ETH_CONTRACT_ADDRESS,
  useCountervalue,
  useCreditBalance,
} from "@cartridge/utils";
import { formatEther } from "viem";
import { CurrencyBase, CurrencyQuote } from "@cartridge/utils/api/cartridge";
import { getChecksumAddress } from "starknet";
import { useConnection } from "@/hooks/context";
import { useAccount } from "@/hooks/account";
import { useTokens } from "@/hooks/token";

export function Tokens() {
  const { isVisible } = useConnection();
  const { username } = useAccount();
  const credit = useCreditBalance({
    username,
    interval: isVisible ? 3000 : undefined,
  });
  const erc20 = useTokens();

  return (
    <Card>
      <CardHeader className="h-10 flex flex-row items-center justify-between">
        <CardTitle>Tokens</CardTitle>
        {credit.isFetching ||
          (erc20.isFetching && <SpinnerIcon className="animate-spin" />)}
      </CardHeader>

      {/* <Link to={`${location.pathname}/token/credit`} state={{ back: location.pathname }}>
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
      </Link> */}

      {erc20.data.map((t) => (
        <Link
          key={t.meta.address}
          to={`${location.pathname}/token/${t.meta.address}`}
        >
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
  const { countervalue } = useCountervalue({
    balance: formatEther(token.balance.value || 0n),
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });

  return (
    <CardContent className="bg-background flex items-center p-0 h-full gap-0.5">
      <div className="bg-secondary flex h-full aspect-square items-center justify-center">
        <img
          src={token.meta.logoUrl ?? "/public/placeholder.svg"}
          className="w-5 h-5"
        />
      </div>

      <div className="bg-secondary flex flex-1 gap-x-1.5 items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div>{token.balance.formatted}</div>
          <div className="text-xs text-muted-foreground">
            {token.meta.symbol}
          </div>
        </div>

        {/* TODO: Enable countervalue for currencies other than ETH */}
        {getChecksumAddress(token.meta.address) ===
          getChecksumAddress(ETH_CONTRACT_ADDRESS) && (
          <div className="text-xs text-muted-foreground">
            ${countervalue.formatted}
          </div>
        )}
      </div>
    </CardContent>
  );
}
