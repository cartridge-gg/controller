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
  CoinsIcon,
  ActivityTokenCard,
  ERC20Detail,
  ERC20Header,
  PaperPlaneIcon,
} from "@cartridge/ui-next";
import { useConnection, useData } from "#hooks/context";
import {
  getDate,
  isIframe,
  isPublicChain,
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

  const txs = useMemo(() => {
    if (!transfers || !token?.metadata?.image) {
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
  }, [transfers, accountAddress, token?.metadata?.image]);

  const to = useCallback((transactionHash: string) => {
    return VoyagerUrl(constants.StarknetChainId.SN_MAIN).transaction(
      transactionHash,
    );
  }, []);

  if (!token) return;

  return (
    <LayoutContainer>
      <LayoutHeader
        className="hidden"
        onBack={closable || visitor ? undefined : handleBack}
      />

      <LayoutContent className="pb-4 gap-6">
        <ERC20Header token={token} />

        <ERC20Detail
          token={token}
          isPublicChain={isPublicChain(chainId)}
          chainId={chainId as constants.StarknetChainId}
        />

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
              <p className="text-foreground-400 font-semibold text-xs py-3 tracking-wider">
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
            <Link to={`send?${searchParams.toString()}`} className="w-full">
              <Button className="w-full space-x-2">
                <PaperPlaneIcon variant="solid" />
                Send
              </Button>
            </Link>
          </div>
        </LayoutFooter>
      )}
    </LayoutContainer>
  );
}
