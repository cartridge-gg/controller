import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";
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
import { useConnection } from "@/hooks/context";
import {
  formatAddress,
  isIframe,
  isPublicChain,
  StarkscanUrl,
  useCountervalue,
  useCreditBalance,
} from "@cartridge/utils";
import { constants } from "starknet";
import { formatEther } from "viem";
import { useAccount } from "@/hooks/account";
import { useToken } from "@/hooks/token";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { useMemo } from "react";
import { compare } from "compare-versions";
import { formatBalance } from "./helper";

export function Token() {
  const { address } = useParams<{ address: string }>();
  const location = useLocation();

  if (location.pathname.endsWith("/send")) {
    return <Outlet />;
  }

  switch (address) {
    case "credit":
      return <Credits />;
    default:
      return <ERC20 />;
  }
}

function Credits() {
  const { parent, isVisible } = useConnection();
  const { username } = useAccount();
  const credit = useCreditBalance({
    username,
    interval: isVisible ? 3000 : undefined,
  });

  return (
    <LayoutContainer
      left={
        <Link to="..">
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

      {isIframe() && (
        <LayoutFooter>
          <Button onClick={() => parent.openPurchaseCredits()}>Purchase</Button>
        </LayoutFooter>
      )}
    </LayoutContainer>
  );
}

function ERC20() {
  const { address } = useParams<{ address: string }>();
  const { version } = useConnection();
  const { chainId } = useConnection();
  const t = useToken({ tokenAddress: address! });
  const { countervalue } = useCountervalue(
    {
      balance: formatEther(t?.balance.value ?? 0n),
      pair: `${t?.meta.symbol}_USDC` as TokenPair,
    },
    { enabled: t && ["ETH", "STRK"].includes(t.meta.symbol) },
  );

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.6", ">=");
  }, [version]);

  if (!t) {
    return;
  }

  return (
    <LayoutContainer
      left={
        <Link to="..">
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
            formatBalance(t.balance.formatted, ["~"])
          )
        } ${t.meta.symbol}`}
        description={
          countervalue && `${formatBalance(countervalue.formatted, ["~"])}`
        }
        icon={
          <img
            className="w-10 h-10"
            src={t.meta.logoUrl ?? "/public/placeholder.svg"}
          />
        }
        rounded
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
                ).contract(t.meta.address)} `}
                className="flex items-center gap-1 text-sm"
                target="_blank"
              >
                <div className="font-medium">
                  {formatAddress(t.meta.address, { size: "sm" })}
                </div>
                <ExternalIcon size="sm" />
              </Link>
            ) : (
              <div>{formatAddress(t.meta.address)}</div>
            )}
          </CardContent>

          <CardContent className="flex items-center justify-between">
            <div className="text-muted-foreground">Token Standard</div>
            <div className="font-medium">ERC-20</div>
          </CardContent>
        </Card>
      </LayoutContent>

      {isIframe() && compatibility && (
        <LayoutFooter>
          <Link to="send">
            <Button className="w-full">Send</Button>
          </Link>
        </LayoutFooter>
      )}
    </LayoutContainer>
  );
}
