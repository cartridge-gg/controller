import { Link, useParams } from "react-router-dom";
import { LayoutContainer, LayoutContent, LayoutHeader } from "../layout";
import {
  ArrowIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ExternalIcon,
  Skeleton,
} from "@cartridge/ui-next";
import { useConnection, useToken } from "@/hooks/context";
import {
  formatAddress,
  isPublicChain,
  StarkscanUrl,
  useCountervalue,
} from "@cartridge/utils";
import { constants } from "starknet";
import { formatEther } from "viem";
import { CurrencyBase, CurrencyQuote } from "@cartridge/utils/api/cartridge";

export function Token() {
  const { chainId } = useConnection();
  const { address } = useParams<{ address: string }>();
  const t = useToken(address!);
  const { countervalue: usdBalance } = useCountervalue({
    endpoint: `${import.meta.env.VITE_CARTRIDGE_API_URL!}/query`,
    balance: formatEther(BigInt(t?.balance ?? 0)),
    quote: CurrencyQuote.Eth,
    base: CurrencyBase.Usd,
  });

  if (!t) {
    return;
  }

  return (
    <LayoutContainer
      left={
        <Link to="/inventory">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={`${
          t.balance === undefined ? (
            <Skeleton className="h-[20px] w-[120px] rounded" />
          ) : (
            t.balance.toString()
          )
        } ${t.symbol}`}
        description={`${usdBalance} ${CurrencyBase.Usd}`}
        icon={
          <img
            className="w-8 h-8"
            src={t.logoUrl ?? "/public/placeholder.svg"}
          />
        }
      />

      <LayoutContent className="pb-4">
        <Card>
          <CardHeader>
            <CardTitle>details</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-muted-foreground">Contract</div>
            {isPublicChain(chainId) ? (
              <Link
                to={`${StarkscanUrl(
                  chainId as constants.StarknetChainId,
                ).contract(t.address)} `}
                className="flex items-center gap-1 text-sm"
                target="_blank"
              >
                <div className="font-medium">
                  {formatAddress(t.address, { size: "sm" })}
                </div>
                <ExternalIcon size="sm" />
              </Link>
            ) : (
              <div>{formatAddress(t.address)}</div>
            )}
          </CardContent>

          <CardContent className="flex items-center justify-between">
            <div className="text-muted-foreground">Token Standard</div>
            <div className="font-medium">ERC-20</div>
          </CardContent>
        </Card>
      </LayoutContent>
    </LayoutContainer>
  );
}
