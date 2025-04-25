import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
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
  DepositIcon,
  ActivityTokenCard,
} from "@cartridge/ui-next";
import { useConnection, useData } from "#hooks/context";
import {
  formatAddress,
  isIframe,
  isPublicChain,
  StarkscanUrl,
  useCreditBalance,
  VoyagerUrl,
} from "@cartridge/utils";
import { constants, getChecksumAddress } from "starknet";
import { useAccount } from "#hooks/account";
import { useToken } from "#hooks/token";
import { useCallback, useMemo } from "react";
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
        title={`${credit.balance} CREDITS`}
        description={`$${credit.balance}`}
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
  const { address: accountAddress } = useAccount();

  const { transfers } = useData();

  const { chainId, version, closable, visitor } = useConnection();
  const { token } = useToken({ tokenAddress: address! });
  const [searchParams] = useSearchParams();

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.6", ">=");
  }, [version]);

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  if (!token) return;

  const getDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (
      date.toDateString() ===
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  const txs = useMemo(() => {
    if (!transfers) {
      return [];
    }

    return transfers.transfers?.items?.flatMap((edge) => {
      return edge.transfers
        .filter(({ tokenId }) => !tokenId)
        .map((transfer, i) => {
          const value = `${(
            BigInt(transfer.amount) / BigInt(10 ** Number(transfer.decimals))
          ).toString()} ${transfer.symbol}`;
          const timestamp = new Date(transfer.executedAt).getTime();
          const date = getDate(timestamp);
          const image = token.metadata.image;
          return {
            key: `${transfer.transactionHash}-${transfer.eventId}-${i}`,
            transactionHash: transfer.transactionHash,
            amount: value,
            to: transfer.toAddress,
            from: transfer.fromAddress,
            contractAddress: transfer.contractAddress,
            symbol: transfer.symbol,
            eventId: transfer.eventId,
            date: date,
            image,
            action:
              getChecksumAddress(transfer.fromAddress) ===
              getChecksumAddress(accountAddress)
                ? "send"
                : ("receive" as "send" | "receive"),
          };
        });
    });
  }, [transfers]);

  const to = useCallback((transactionHash: string) => {
    return VoyagerUrl(constants.StarknetChainId.SN_MAIN).transaction(
      transactionHash,
    );
  }, []);

  return (
    <LayoutContainer>
      <LayoutHeader
        className="hidden"
        onBack={closable || visitor ? undefined : handleBack}
      />

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
                {`$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </p>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-xs">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-foreground-300 font-normal text-sm">
              Contract Address
            </p>
            {isPublicChain(chainId) ? (
              <Link
                to={`${StarkscanUrl(
                  chainId as constants.StarknetChainId,
                ).contract(token.metadata.address)} `}
                className="flex items-center gap-1 text-sm"
                target="_blank"
              >
                <p className="font-medium">
                  {formatAddress(token.metadata.address, {
                    size: "sm",
                    first: 4,
                    last: 4,
                  })}
                </p>
                <ExternalIcon size="sm" />
              </Link>
            ) : (
              <p>
                {formatAddress(token.metadata.address, { first: 4, last: 4 })}
              </p>
            )}
          </CardContent>

          <CardContent className="flex items-center justify-between">
            <p className="text-foreground-300 font-normal text-sm">
              Token Standard
            </p>
            <p className="font-medium text-sm text-foreground-100">ERC-20</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {Object.entries(
            txs
              .filter((tx) => tx?.symbol === token.metadata.symbol)
              .reduce(
                (acc, tx) => {
                  if (!acc[tx.date]) {
                    acc[tx.date] = [];
                  }
                  acc[tx.date].push(tx);
                  return acc;
                },
                {} as Record<string, typeof txs>,
              ),
          ).map(([date, transactions]) => (
            <div key={date} className="flex flex-col gap-3">
              <p className="text-foreground-300 font-medium text-sm py-3">
                {date}
              </p>
              {transactions.map((item) => (
                <Link
                  key={item.key}
                  to={to(item.transactionHash)}
                  target="_blank"
                >
                  <ActivityTokenCard
                    amount={item.amount}
                    // no price available from the oracle for $PAPER
                    value=""
                    address={item.action === "send" ? item.to : item.from}
                    image={token.metadata.image!}
                    action={item.action}
                  />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </LayoutContent>

      {isIframe() && compatibility && !visitor && (
        <LayoutFooter>
          <div className="flex items-center gap-3">
            <Thumbnail
              icon={<DepositIcon variant="solid" size="sm" />}
              size="lg"
              className="aspect-square"
            />
            <Link to={`send?${searchParams.toString()}`} className="w-full">
              <Button className="w-full">Send</Button>
            </Link>
          </div>
        </LayoutFooter>
      )}
    </LayoutContainer>
  );
}
