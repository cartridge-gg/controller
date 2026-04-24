import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CallData,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  cairo,
  constants,
  uint256,
} from "starknet";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  HeaderInner,
  Input,
  LayoutContent,
  LayoutFooter,
  Separator,
  SlotIcon,
  TokenCard,
  TokenSummary,
} from "@cartridge/controller-ui";
import { STRK_CONTRACT_ADDRESS } from "@cartridge/controller-ui/utils";
import { cn } from "@cartridge/controller-ui/utils";
import { useConnection } from "@/hooks/connection";
import { formatBalance } from "@/hooks/tokens";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { ErrorAlert } from "@/components/ErrorAlert";
import {
  createStarknetCryptoPayment,
  waitForCryptoPaymentConfirmation,
} from "@/hooks/payments/crypto";
import { Team } from "./teams";

type SlotFundingToken = {
  key: "USDC" | "STRK";
  symbol: "USDC" | "STRK";
  name: string;
  decimals: number;
  address: string;
  icon: string;
  presetAmounts: string[];
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

type FundingPhase = "idle" | "creating" | "transferring" | "confirming";

export function SlotCryptoFund({
  team,
  onBack,
  onComplete,
}: SlotCryptoFundProps) {
  const { controller } = useConnection();
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
        presetAmounts: ["10", "25", "50"],
      },
      {
        key: "STRK",
        symbol: "STRK",
        name: "Starknet Token",
        decimals: 18,
        address: STRK_CONTRACT_ADDRESS,
        icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
        presetAmounts: ["100", "500", "1000"],
      },
    ];
  }, [controller]);

  const selectedToken = useMemo(
    () => tokens.find((token) => token.key === selectedTokenKey) ?? tokens[0],
    [selectedTokenKey, tokens],
  );

  useEffect(() => {
    setAmountInput(selectedToken.presetAmounts[0]);
    setError(null);
  }, [selectedToken]);

  useEffect(() => {
    if (!controller || !selectedToken) {
      return;
    }

    let cancelled = false;
    setIsBalanceLoading(true);
    setBalance(null);
    setBalanceError(null);

    fetchTokenBalance(
      controller.provider,
      selectedToken.address,
      controller.address(),
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
  }, [controller, selectedToken]);

  const amount = useMemo(
    () => parseTokenAmount(amountInput, selectedToken.decimals),
    [amountInput, selectedToken.decimals],
  );

  const isSubmitting = phase !== "idle";
  const hasInsufficientBalance =
    amount !== undefined && balance !== null && amount > balance;
  const canSubmit =
    !!controller &&
    amount !== undefined &&
    amount > 0n &&
    !hasInsufficientBalance &&
    !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!controller || !amount || amount <= 0n) {
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
      const { transaction_hash } = await controller.execute([
        {
          contractAddress: selectedToken.address,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: payment.depositAddress,
            amount: cairo.uint256(amount),
          }),
        },
      ]);

      const receipt = await controller.provider.waitForTransaction(
        transaction_hash,
        {
          retryInterval: 1000,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        },
      );

      if (isReceiptError(receipt)) {
        throw new Error(receipt.value.message || "Transfer failed");
      }

      setPhase("confirming");
      await waitForCryptoPaymentConfirmation(payment.id);
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
  }, [amount, controller, onComplete, selectedToken, team.id]);

  const creditsUsd = formatBalance(BigInt(team.credits || 0), 8, 2);
  const strkBalance = formatBalance(BigInt(team.strk || 0), 6, 2);
  const phaseLabel = getPhaseLabel(phase);

  return (
    <>
      <HeaderInner
        title={`Fund ${team.name}`}
        icon={<SlotIcon size="lg" />}
        hideIcon
      />
      <LayoutContent className="pb-3 flex flex-col gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case font-semibold text-xs">
              Team Balance
            </CardTitle>
          </CardHeader>
          <TokenSummary className="rounded-tl-none rounded-tr-none">
            <TokenCard
              title="Credits"
              image="https://static.cartridge.gg/presets/credit/icon.svg"
              amount={`${creditsUsd} USD`}
              value={`$${creditsUsd}`}
            />
            <TokenCard
              title="STRK"
              image={tokens[1].icon}
              amount={`${strkBalance} STRK`}
            />
          </TokenSummary>
        </Card>

        <Card className="p-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-foreground-400 tracking-wide select-none">
              Token
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tokens.map((token) => (
                <Button
                  key={token.key}
                  variant="secondary"
                  disabled={isSubmitting}
                  className={cn(
                    "h-auto justify-start gap-3 p-3",
                    token.key === selectedToken.key
                      ? "bg-background-400 text-foreground-100 hover:bg-background-400 hover:text-foreground-100"
                      : "bg-background-200 text-foreground-300 hover:bg-background-300 hover:text-foreground-200",
                  )}
                  onClick={() => setSelectedTokenKey(token.key)}
                >
                  <img
                    src={token.icon}
                    alt=""
                    className="h-5 w-5 rounded-full shrink-0"
                  />
                  <span className="min-w-0 truncate">{token.symbol}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-spacer" />

          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-foreground-400 tracking-wide select-none">
              Amount
            </div>
            <Input
              value={amountInput}
              disabled={isSubmitting}
              type="text"
              inputMode="decimal"
              onChange={(event) => {
                setAmountInput(event.target.value);
                setError(null);
              }}
            />
            <div className="grid grid-cols-3 gap-2">
              {selectedToken.presetAmounts.map((preset) => (
                <Button
                  key={`${selectedToken.key}-${preset}`}
                  variant="secondary"
                  className="text-sm font-sans font-medium"
                  disabled={isSubmitting}
                  onClick={() => setAmountInput(preset)}
                >
                  {preset}
                </Button>
              ))}
            </div>
            <div className="text-xs text-foreground-400">
              Available:{" "}
              {isBalanceLoading
                ? "Loading"
                : balance !== null
                  ? `${formatBalance(balance, selectedToken.decimals, 2)} ${selectedToken.symbol}`
                  : "-"}
            </div>
          </div>
        </Card>
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
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            className="flex-1"
            isLoading={isSubmitting}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {phaseLabel}
          </Button>
        </div>
      </LayoutFooter>
    </>
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
    case "confirming":
      return "Confirming";
    case "idle":
      return "Fund";
  }
}

function isReceiptError(
  receipt: unknown,
): receipt is { isError: () => true; value: { message?: string } } {
  return (
    typeof receipt === "object" &&
    receipt !== null &&
    "isError" in receipt &&
    typeof receipt.isError === "function" &&
    receipt.isError()
  );
}

function getHumanReadableError(error: Error): string {
  if (error.message.includes("USER_REFUSED_OP")) {
    return "Transaction approval refused";
  }

  return error.message;
}
