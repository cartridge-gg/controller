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
  Button,
  ActivityTokenCard,
  ERC20Detail,
  ERC20Header,
  PaperPlaneIcon,
  Thumbnail,
  InfoIcon,
} from "@cartridge/ui";
import { NavigationHeader } from "@/components";
import { useData } from "#profile/hooks/data";
import {
  getDate,
  isPublicChain,
  useCreditBalance,
  VoyagerUrl,
} from "@cartridge/ui/utils";
import { constants, getChecksumAddress } from "starknet";
import { useAccount } from "#profile/hooks/account";
import { useToken } from "#profile/hooks/token";
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
  // TODO: Get parent from keychain connection if needed
  const isVisible = true; // Always visible in keychain
  const { username } = useAccount();
  const credit = useCreditBalance({
    username,
    interval: isVisible ? 30000 : undefined,
  });

  return (
    <LayoutContainer>
      <NavigationHeader
        variant="hidden"
        onBack={() => {
          navigate("..");
        }}
      />

      <LayoutContent className="pb-4 gap-6">
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
            // TODO: Implement purchase credits
            console.log("Purchase credits clicked");
          }}
        >
          Purchase
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}

function ERC20() {
  const { address } = useParams<{ address: string }>();
  const { address: accountAddress } = useAccount();

  const { transfers } = useData();

  // const { closable, visitor } = useProfileContext();
  const chainId = constants.StarknetChainId.SN_MAIN; // Use mainnet as default
  const version = "0.5.6"; // Default version for compatibility
  const { token } = useToken({ tokenAddress: address! });
  const [searchParams] = useSearchParams();

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.6", ">=");
  }, [version]);

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
      <NavigationHeader className="hidden" />

      <LayoutContent className="pb-4 gap-6">
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

      {compatibility && (
        <LayoutFooter>
          <Link to={`send?${searchParams.toString()}`} className="w-full">
            <Button className="w-full space-x-2">
              <PaperPlaneIcon variant="solid" />
              Send
            </Button>
          </Link>
        </LayoutFooter>
      )}
    </LayoutContainer>
  );
}
