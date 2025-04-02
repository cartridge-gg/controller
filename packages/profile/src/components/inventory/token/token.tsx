import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CoinsIcon,
  ExternalIcon,
  Skeleton,
  Thumbnail,
} from "@cartridge/ui-next";
import { useConnection } from "#hooks/context";
import {
  formatAddress,
  isIframe,
  isPublicChain,
  StarkscanUrl,
  useCreditBalance,
} from "@cartridge/utils";
import { constants } from "starknet";
import { useAccount } from "#hooks/account";
import { useToken } from "#hooks/token";
import { useMemo } from "react";
import { compare } from "compare-versions";

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
  const navigate = useNavigate();
  const { parent, isVisible } = useConnection();
  const { username } = useAccount();
  const credit = useCreditBalance({
    username,
    interval: isVisible ? 3000 : undefined,
  });

  return (
    <LayoutContainer>
      <LayoutHeader
        title={`${credit.balance.formatted} CREDITS`}
        description={`$${credit.balance.formatted}`}
        icon={<CoinsIcon variant="solid" size="lg" />}
        onBack={() => {
          navigate("..");
        }}
      />

      <LayoutContent className="pb-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div className="text-foreground-400">
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
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();
  const { chainId, version } = useConnection();
  const { token } = useToken({ tokenAddress: address! });

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.6", ">=");
  }, [version]);

  if (!token) return;

  return (
    <LayoutContainer>
      <LayoutHeader className="hidden" onBack={() => navigate("..")} />

      <LayoutContent className="pb-4 gap-6">
        <div className="flex items-center gap-4">
          <Thumbnail icon={token.metadata.image} size="lg" rounded />
          <div className="flex flex-col gap-0.5">
            {token.balance === undefined ? (
              <Skeleton className="h-[20px] w-[120px] rounded" />
            ) : (
              <p className="text-semibold text-lg/[22px]">
                {`${token.balance.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.metadata.symbol}`}
              </p>
            )}
            {!!token.balance.value && (
              <p className="text-foreground-300 text-xs">
                {`~$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </p>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-foreground-400">Contract</div>
            {isPublicChain(chainId) ? (
              <Link
                to={`${StarkscanUrl(
                  chainId as constants.StarknetChainId,
                ).contract(token.metadata.address)} `}
                className="flex items-center gap-1 text-sm"
                target="_blank"
              >
                <div className="font-medium">
                  {formatAddress(token.metadata.address, { size: "sm" })}
                </div>
                <ExternalIcon size="sm" />
              </Link>
            ) : (
              <div>{formatAddress(token.metadata.address)}</div>
            )}
          </CardContent>

          <CardContent className="flex items-center justify-between">
            <div className="text-foreground-400">Token Standard</div>
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
