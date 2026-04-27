import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  Connector,
  StarknetConfig,
  cartridge,
  useAccount,
  useConnect,
  useInjectedConnectors,
} from "@starknet-react/core";
import { CallData, cairo, constants, num, uint256, wallet } from "starknet";
import {
  ArgentIcon,
  BraavosIcon,
  Button,
  Card,
  CardHeader,
  CardTitle,
  HeaderInner,
  Input,
  LayoutContent,
  LayoutFooter,
  Select,
  SelectContent,
  SelectItem,
  SlotIcon,
  Thumbnail,
  TokenCard,
  TokenSelectHeader,
  TokenSummary,
} from "@cartridge/controller-ui";
import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useFeeToken,
} from "@/hooks/tokens";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { STRK_CONTRACT_ADDRESS } from "@cartridge/controller-ui/utils";
import { ErrorAlert } from "@/components/ErrorAlert";
import { createStarknetCryptoPayment } from "@/hooks/payments/crypto";
import { Team } from "./teams";

const STRK_ICON =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo";

type SlotFundingToken = {
  key: "USDC" | "STRK";
  symbol: "USDC" | "STRK";
  name: string;
  decimals: number;
  address: string;
  icon: string;
  defaultAmount: string;
  min: number;
  max: number;
};

export type SlotFundingResult = {
  token: SlotFundingToken;
  amount: bigint;
  paymentId: string;
  transactionHash: string;
};

type SlotCryptoFundProps = {
  team: Team;
  onBack: () => void;
  onComplete: (result: SlotFundingResult) => void;
};

type FundingPhase = "idle" | "creating" | "transferring";

export function SlotCryptoFund(props: SlotCryptoFundProps) {
  return (
    <ExternalWalletProvider>
      <SlotCryptoFundInner {...props} />
    </ExternalWalletProvider>
  );
}

function SlotCryptoFundInner({
  team,
  onBack,
  onComplete,
}: SlotCryptoFundProps) {
  const { controller } = useConnection();
  const { setOnBackCallback } = useNavigation();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { account: extAccount } = useAccount();

  useEffect(() => {
    setOnBackCallback(() => onBack);
    return () => setOnBackCallback(undefined);
  }, [setOnBackCallback, onBack]);

  const { token: feeToken } = useFeeToken();
  const teamUsdBalance = formatBalance(BigInt(team.credits || 0), 8, 2);
  const teamStrkBalance = formatBalance(BigInt(team.strk || 0), 6, 2);
  const teamStrkUsdValue = feeToken?.price
    ? convertTokenAmountToUSD(BigInt(team.strk || 0), 6, feeToken.price)
    : undefined;

  const [selectedTokenKey, setSelectedTokenKey] =
    useState<SlotFundingToken["key"]>("USDC");
  const [amountInput, setAmountInput] = useState("10");
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<Error | null>(null);
  const [phase, setPhase] = useState<FundingPhase>("idle");
  const [error, setError] = useState<Error | null>(null);

  const tokens = useMemo<SlotFundingToken[]>(() => {
    const chainId = controller?.chainId();
    const usdcAddress =
      (chainId && USDC_ADDRESSES[chainId]) ??
      USDC_ADDRESSES[constants.StarknetChainId.SN_MAIN];

    return [
      {
        key: "USDC",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        address: usdcAddress,
        icon: "https://static.cartridge.gg/tokens/usdc.svg",
        defaultAmount: "10",
        min: 1,
        max: 2000,
      },
      {
        key: "STRK",
        symbol: "STRK",
        name: "Starknet Token",
        decimals: 18,
        address: STRK_CONTRACT_ADDRESS,
        icon: STRK_ICON,
        defaultAmount: "10",
        min: 1,
        max: 50000,
      },
    ];
  }, [controller]);

  const selectedToken = useMemo(
    () => tokens.find((token) => token.key === selectedTokenKey) ?? tokens[0],
    [selectedTokenKey, tokens],
  );

  useEffect(() => {
    setAmountInput(selectedToken.defaultAmount);
    setError(null);
  }, [selectedToken]);

  useEffect(() => {
    if (!controller || !extAccount || !selectedToken) {
      setBalance(null);
      setIsBalanceLoading(false);
      setBalanceError(null);
      return;
    }

    let cancelled = false;
    setIsBalanceLoading(true);
    setBalance(null);
    setBalanceError(null);

    fetchTokenBalance(
      controller.provider,
      selectedToken.address,
      extAccount.address,
    )
      .then((nextBalance) => {
        if (!cancelled) {
          setBalance(nextBalance);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBalanceError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsBalanceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [controller, extAccount, selectedToken]);

  const amount = useMemo(
    () => parseTokenAmount(amountInput, selectedToken.decimals),
    [amountInput, selectedToken.decimals],
  );

  const minAmount = useMemo(
    () =>
      parseTokenAmount(selectedToken.min.toString(), selectedToken.decimals),
    [selectedToken.min, selectedToken.decimals],
  );
  const maxAmount = useMemo(
    () =>
      parseTokenAmount(selectedToken.max.toString(), selectedToken.decimals),
    [selectedToken.max, selectedToken.decimals],
  );

  const isSubmitting = phase !== "idle";
  const hasInsufficientBalance =
    amount !== undefined && balance !== null && amount > balance;
  const isBelowMin =
    amount !== undefined && minAmount !== undefined && amount < minAmount;
  const isAboveMax =
    amount !== undefined && maxAmount !== undefined && amount > maxAmount;
  const canSubmit =
    !!controller &&
    !!extAccount &&
    amount !== undefined &&
    amount > 0n &&
    !hasInsufficientBalance &&
    !isBelowMin &&
    !isAboveMax &&
    !isSubmitting;

  const onConnect = useCallback(
    (c: Connector) => {
      if (!controller) return;

      connectAsync({ connector: c })
        .then(async () => {
          const connectedChain = await c.chainId();
          if (num.toHex(connectedChain) !== controller.chainId()) {
            await wallet.switchStarknetChain(
              window.starknet,
              controller.chainId(),
            );
          }
        })
        .catch(() => {
          /* user abort */
        });
    },
    [connectAsync, controller],
  );

  const handleSubmit = useCallback(async () => {
    if (!controller || !extAccount || !amount || amount <= 0n) {
      return;
    }

    setError(null);

    try {
      setPhase("creating");
      const payment = await createStarknetCryptoPayment({
        tokenAddress: selectedToken.address,
        tokenAmount: amount,
        teamId: team.id,
        isMainnet: controller.chainId() === constants.StarknetChainId.SN_MAIN,
      });

      setPhase("transferring");
      const { transaction_hash } = await extAccount.execute([
        {
          contractAddress: selectedToken.address,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: payment.depositAddress,
            amount: cairo.uint256(amount),
          }),
        },
      ]);

      onComplete({
        token: selectedToken,
        amount,
        paymentId: payment.id,
        transactionHash: transaction_hash,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setPhase("idle");
    }
  }, [amount, controller, extAccount, onComplete, selectedToken, team.id]);

  const phaseLabel = getPhaseLabel(phase);
  const walletConnectors = connectors.filter((c) =>
    ["argentX", "braavos"].includes(c.id),
  );

  return (
    <>
      <HeaderInner
        title={`Fund Team ${team.name}`}
        icon={<SlotIcon size="lg" />}
        hideIcon
      />
      <LayoutContent className="pb-8 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case font-semibold text-xs">
              Balances
            </CardTitle>
          </CardHeader>
          <TokenSummary className="rounded-tl-none rounded-tr-none">
            <TokenCard
              title="USD"
              image="https://static.cartridge.gg/media/usd_icon.svg"
              amount={`${teamUsdBalance} USD`}
              value={`$${teamUsdBalance}`}
              className="pointer-events-none"
            />
            <TokenCard
              title="STRK"
              image={STRK_ICON}
              amount={`${teamStrkBalance} STRK`}
              value={teamStrkUsdValue}
              className="pointer-events-none"
            />
          </TokenSummary>
        </Card>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-foreground-400 tracking-wide select-none">
            Amount
          </div>
          <div className="flex gap-3">
            <Input
              containerClassName="flex-1"
              value={amountInput}
              disabled={isSubmitting}
              type="text"
              inputMode="decimal"
              onChange={(event) => {
                setAmountInput(event.target.value);
                setError(null);
              }}
            />
            <Select
              value={selectedToken.address}
              onValueChange={(address) => {
                const next = tokens.find((t) => t.address === address);
                if (next) setSelectedTokenKey(next.key);
              }}
              disabled={isSubmitting}
            >
              <TokenSelectHeader className="h-10 w-fit rounded flex gap-2 items-center p-2" />
              <SelectContent viewPortClassName="gap-0 bg-background-100 flex flex-col gap-px">
                {tokens.map((token) => (
                  <SelectItem
                    key={token.address}
                    simplified
                    value={token.address}
                    data-active={token.address === selectedToken.address}
                    className="h-10 group bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-100 cursor-pointer data-[active=true]:bg-background-200 data-[active=true]:hover:bg-background-300 data-[active=true]:text-foreground-100 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <Thumbnail
                        icon={token.icon}
                        rounded
                        size="sm"
                        variant="light"
                        className="group-hover:bg-background-400"
                      />
                      <span className="font-medium text-sm">
                        {token.symbol}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {extAccount && (
            <div className="text-xs text-foreground-400">
              Available:{" "}
              {isBalanceLoading
                ? "Loading"
                : balance !== null
                  ? `${formatBalance(balance, selectedToken.decimals, 2)} ${selectedToken.symbol}`
                  : "-"}
            </div>
          )}
        </div>
      </LayoutContent>
      <LayoutFooter>
        {balanceError && (
          <ErrorAlert
            variant="error"
            title="Balance Error"
            description={balanceError.message}
          />
        )}
        {amountInput && amount === undefined && (
          <ErrorAlert
            variant="error"
            title="Invalid Amount"
            description={`Enter a valid ${selectedToken.symbol} amount.`}
          />
        )}
        {isBelowMin && (
          <ErrorAlert
            variant="error"
            title="Amount Too Low"
            description={`Minimum is ${selectedToken.min} ${selectedToken.symbol}.`}
          />
        )}
        {isAboveMax && (
          <ErrorAlert
            variant="error"
            title="Amount Too High"
            description={`Maximum is ${selectedToken.max.toLocaleString()} ${selectedToken.symbol}.`}
          />
        )}
        {hasInsufficientBalance && (
          <ErrorAlert
            variant="error"
            title="Insufficient Balance"
            description={`You do not have enough ${selectedToken.symbol}.`}
          />
        )}
        {error && (
          <ErrorAlert
            variant="error"
            title="Funding Error"
            description={getHumanReadableError(error)}
          />
        )}
        {!extAccount ? (
          isConnecting ? (
            <Button isLoading />
          ) : walletConnectors.length > 0 ? (
            <div className="flex gap-3">
              {walletConnectors.map((c) => (
                <Button
                  key={c.id}
                  className="flex-1"
                  onClick={() => onConnect(c)}
                >
                  {c.id === "argentX" ? (
                    <ArgentIcon size="sm" />
                  ) : c.id === "braavos" ? (
                    <BraavosIcon size="sm" />
                  ) : null}
                  {c.name}
                </Button>
              ))}
            </div>
          ) : (
            <ErrorAlert
              variant="info"
              title="No Starknet wallet detected"
              description="Install Argent or Braavos to fund this team."
            />
          )
        ) : (
          <Button
            isLoading={isSubmitting}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {phaseLabel}
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}

function ExternalWalletProvider({ children }: PropsWithChildren) {
  const { connectors } = useInjectedConnectors({});
  const { controller } = useConnection();
  const defaultChainId = useMemo(
    () => num.toBigInt(controller?.chainId() || 0),
    [controller],
  );

  if (!controller) {
    return <>{children}</>;
  }

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      defaultChainId={defaultChainId}
      provider={() => controller.provider}
      connectors={connectors}
      explorer={cartridge}
    >
      {children}
    </StarknetConfig>
  );
}

export function parseTokenAmount(
  value: string,
  decimals: number,
): bigint | undefined {
  const trimmed = value.trim();
  if (!trimmed || !/^\d+(\.\d*)?$/.test(trimmed)) {
    return undefined;
  }

  const [whole, fractional = ""] = trimmed.split(".");
  if (fractional.length > decimals) {
    return undefined;
  }

  const base = 10n ** BigInt(decimals);
  const wholeAmount = BigInt(whole) * base;
  const fractionalAmount = BigInt(fractional.padEnd(decimals, "0") || "0");
  return wholeAmount + fractionalAmount;
}

async function fetchTokenBalance(
  provider: {
    callContract: (args: {
      contractAddress: string;
      entrypoint: string;
      calldata: string[];
    }) => Promise<string[]>;
  },
  tokenAddress: string,
  accountAddress: string,
): Promise<bigint> {
  const entrypoints = ["balanceOf", "balance_of"];
  let lastError: unknown;

  for (const entrypoint of entrypoints) {
    try {
      const result = await provider.callContract({
        contractAddress: tokenAddress,
        entrypoint,
        calldata: [accountAddress],
      });

      return uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to retrieve token balance");
}

function getPhaseLabel(phase: FundingPhase) {
  switch (phase) {
    case "creating":
      return "Creating";
    case "transferring":
      return "Sending";
    case "idle":
      return "Fund";
  }
}

function getHumanReadableError(error: Error): string {
  if (error.message.includes("USER_REFUSED_OP")) {
    return "Transaction approval refused in wallet";
  }

  return error.message;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    starknet: any;
  }
}
