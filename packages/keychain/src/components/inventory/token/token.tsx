import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  ActivityTokenCard,
  ERC20Detail,
  ERC20Header,
  PaperPlaneIcon,
  InfoIcon,
  Skeleton,
  Thumbnail,
} from "@cartridge/ui";

import { useData } from "@/hooks/data";
import { getDate, isPublicChain, useCreditBalance } from "@cartridge/ui/utils";
import { useExplorer } from "@starknet-react/core";
import { constants, getChecksumAddress } from "starknet";
import { useAccount } from "@/hooks/account";
import { useToken } from "@/hooks/token";
import { useCallback, useMemo } from "react";
import { useConnection } from "@/hooks/connection";
import { useVersion } from "@/hooks/version";
import { useNavigation } from "@/context/navigation";

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
  // TODO: Get parent from keychain connection if needed
  const { navigate } = useNavigation();
  const account = useAccount();
  const username = account?.username || "";
  const credit = useCreditBalance({
    username,
    interval: 30000,
  });

  // Show loading state while credits are being fetched
  if (credit.balance.value === undefined) {
    return <CreditsLoadingState />;
  }

  return (
    <>
      <LayoutContent>
        <div className="flex gap-4 items-center">
          <Thumbnail
            icon="https://static.cartridge.gg/presets/credit/icon.svg"
            size="lg"
            rounded
          />
          <p className="text-foreground-100 text-lg/6 font-semibold">{`${Number(credit.balance.value) / 10 ** 6} CREDITS`}</p>
        </div>

        <div className="flex gap-1 bg-background-125 border border-background-200 px-3 py-2.5 rounded text-foreground-300">
          <InfoIcon size="sm" className="min-w-5" />
          <p className="px-1 text-xs">
            Credits are used to pay for network activity. They are not tokens
            and cannot be transferred or refunded.
          </p>
        </div>
      </LayoutContent>

      <LayoutFooter className="gap-4">
        <Button
          onClick={() => {
            navigate("/funding/credits");
          }}
        >
          Purchase
        </Button>
      </LayoutFooter>
    </>
  );
}

const CreditsLoadingState = () => {
  return (
    <>
      <LayoutContent className="select-none h-full overflow-hidden">
        {/* Credits header skeleton */}
        <div className="flex gap-4 items-center">
          <Skeleton className="w-16 h-16 rounded-full bg-background-300 animate-pulse" />
          <Skeleton className="h-6 w-40 rounded bg-background-300 animate-pulse" />
        </div>

        {/* Credits info skeleton */}
        <div className="flex gap-1 bg-background-125 border border-background-200 px-3 py-2.5 rounded">
          <Skeleton className="w-5 h-5 rounded bg-background-300 animate-pulse" />
          <div className="flex flex-col gap-1 px-1 flex-1">
            <Skeleton className="h-3 w-full rounded bg-background-300 animate-pulse" />
            <Skeleton className="h-3 w-3/4 rounded bg-background-300 animate-pulse" />
          </div>
        </div>
      </LayoutContent>

      <LayoutFooter className="gap-4">
        <Skeleton className="h-11 w-full rounded bg-background-300 animate-pulse" />
      </LayoutFooter>
    </>
  );
};

function ERC20() {
  const { address } = useParams<{ address: string }>();
  const account = useAccount();
  const accountAddress = account?.address || "";
  const { controller } = useConnection();
  const explorer = useExplorer();
  const { transfers } = useData();
  const { isControllerGte } = useVersion();

  const chainId = constants.StarknetChainId.SN_MAIN; // Use mainnet as default
  const { token } = useToken({ tokenAddress: address! });
  const [searchParams] = useSearchParams();

  const compatibility = useMemo(() => {
    return isControllerGte("0.5.6");
  }, [isControllerGte]);

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

  const to = useCallback(
    (transactionHash: string) => {
      return explorer.transaction(transactionHash);
    },
    [explorer],
  );

  if (!token) {
    return null;
  }

  return (
    <>
      <LayoutContent>
        <ERC20Header token={token} />

        <ERC20Detail
          token={token}
          isPublicChain={isPublicChain(chainId || "")}
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

      {compatibility && controller && (
        <LayoutFooter className="p-4">
          <Link to={`send?${searchParams.toString()}`} className="w-full">
            <Button className="w-full space-x-2">
              <PaperPlaneIcon variant="solid" />
              Send
            </Button>
          </Link>
        </LayoutFooter>
      )}
    </>
  );
}
