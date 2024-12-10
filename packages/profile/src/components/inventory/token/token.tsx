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
  useEkuboMetadata,
} from "@cartridge/utils";
import { constants, getChecksumAddress } from "starknet";
import { formatEther } from "viem";
import { useAccount } from "@/hooks/account";
import { useBalance } from "@/hooks/token";
import { TokenPair } from "@cartridge/utils/api/cartridge";

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
  // const [searchParams, setSearchParams] = useSearchParams();

  const { chainId } = useConnection();
  const balance = useBalance({ tokenAddress: address! });
  const { countervalue } = useCountervalue(
    {
      balance: formatEther(BigInt(balance?.raw ?? 0)),
      pair: `${balance?.meta.symbol}_USDC` as TokenPair,
    },
    { enabled: balance && ["ETH", "STRK"].includes(balance.meta.symbol) },
  );
  const ekuboMetaList = useEkuboMetadata();
  const ekuboMeta = balance
    ? ekuboMetaList.find(
        (m) =>
          getChecksumAddress(m.l2_token_address) ===
          getChecksumAddress(balance.meta.contractAddress),
      )
    : undefined;

  if (!balance) {
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
        title={
          balance === undefined ? (
            <Skeleton className="h-[20px] w-[120px] rounded" />
          ) : (
            `${balance.amount} ${balance.meta.symbol}`
          )
        }
        description={countervalue && `${countervalue.formatted} (USD)`}
        icon={
          <img
            className="w-8 h-8"
            src={ekuboMeta?.logo_url ?? "/public/placeholder.svg"}
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
                ).contract(balance.meta.contractAddress)} `}
                className="flex items-center gap-1 text-sm"
                target="_blank"
              >
                <div className="font-medium">
                  {formatAddress(balance.meta.contractAddress, { size: "sm" })}
                </div>
                <ExternalIcon size="sm" />
              </Link>
            ) : (
              <div>{formatAddress(balance.meta.contractAddress)}</div>
            )}
          </CardContent>

          <CardContent className="flex items-center justify-between">
            <div className="text-muted-foreground">Token Standard</div>
            <div className="font-medium">ERC-20</div>
          </CardContent>
        </Card>
      </LayoutContent>

      {/* {isIframe() && (
        <LayoutFooter>
          <Link to="send">
            <Button className="w-full">Send</Button>
          </Link>
        </LayoutFooter>
      )} */}
    </LayoutContainer>
  );
}
