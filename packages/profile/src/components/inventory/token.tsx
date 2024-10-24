import { Link, useParams } from "react-router-dom";
import { LayoutContainer, LayoutContent, LayoutHeader } from "../layout";
import {
  ArrowIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CoinsIcon,
  ExternalIcon,
  Skeleton,
} from "@cartridge/ui-next";
import { useAccount, useConnection, useToken } from "@/hooks/context";
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
  const { address } = useParams<{ address: string }>();

  switch (address) {
    case "credit":
      return <Credits />;
    default:
      return <ERC20 />;
  }
}

function Credits() {
  const { credit } = useAccount();
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
        title={`${credit.balance.formatted} CREDITS`}
        description={`$${credit.balance.formatted}`}
        icon={<CoinsIcon variant="solid" size="lg" />}
      />

      <LayoutContent className="pb-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div className="text-muted-foreground">
              Credits are used to pay for network activity. They are not tokens
              and cannot be transferred or refunded.
            </div>
          </CardContent>
        </Card>
      </LayoutContent>
    </LayoutContainer>
  );
}

function ERC20() {
  const { chainId } = useConnection();
  const { address } = useParams<{ address: string }>();
  const t = useToken(address!);
  const { countervalue } = useCountervalue({
    balance: formatEther(t?.balance.value ?? 0n),
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
            t.balance.formatted
          )
        } ${t.symbol}`}
        description={`${countervalue.formatted} ${CurrencyBase.Usd}`}
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
