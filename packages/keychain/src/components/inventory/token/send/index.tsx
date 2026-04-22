import { useToken } from "@/hooks/token";
import { PaperPlaneIcon, TokenCard } from "@cartridge/controller-ui";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { Call, FeeEstimate, uint256 } from "starknet";
import { RecipientCard } from "@/components/modules/RecipientCard";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useToast } from "@/context/toast";
import { formatTokenAmount, formatUsdValue } from "@/utils/format-value";
import { ErrorAlert } from "@/components/ErrorAlert";

export function SendToken() {
  const [searchParams] = useSearchParams();
  const tokenAddress = searchParams.get("tokenAddress");
  const recipient = searchParams.get("recipient") ?? "0x0";
  const amount = BigInt(searchParams.get("amount") ?? 0n);

  const recipientError = recipient === "0x0";
  const amountError = amount === 0n;

  const { controller } = useConnection();
  const { goBack } = useNavigation();
  const { token, status: tokenFetching } = useToken({
    tokenAddress: tokenAddress!,
  });

  // Build transactions when send is confirmed
  const transactions = useMemo(() => {
    if (
      recipientError ||
      amountError ||
      !token ||
      tokenFetching !== "success"
    ) {
      return undefined;
    }

    const calls: Call[] = [
      {
        contractAddress: token.metadata.address,
        entrypoint: "transfer",
        calldata: [recipient, uint256.bnToUint256(amount)],
      },
    ];

    return calls;
  }, [token, recipient, amount, recipientError, amountError, tokenFetching]);

  const formattedAmount = useMemo(() => {
    return token?.metadata ? formatTokenAmount(amount, 5, token.metadata) : "";
  }, [amount, token?.metadata]);

  const { toast } = useToast();

  const submitToast = useCallback(() => {
    toast.marketplace("Tokens sent successfully!", {
      action: "sent",
      itemNames: [formattedAmount],
      itemImages: [token?.metadata.image ?? ""],
      collectionName: token?.metadata.name ?? "",
    });
  }, [toast, formattedAmount, token?.metadata]);

  const onSubmitSend = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !transactions || !controller) {
        return;
      }

      try {
        await controller.execute(transactions, maxFee);
        submitToast();
        // Navigate back to inventory
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to send tokens");
        throw error;
      }
    },
    [transactions, controller, goBack, toast, submitToast],
  );

  if (!token) {
    return null;
  }

  return (
    <ExecutionContainer
      title="Review Transaction"
      icon={
        <PaperPlaneIcon
          variant="solid"
          size="lg"
          className="h-[30px] w-[30px]"
        />
      }
      transactions={transactions ?? []}
      onSubmit={onSubmitSend}
      buttonText="Confirm"
    >
      <div className="p-4 pt-2 flex flex-col gap-4">
        <RecipientCard address={recipient || "0x0"} />

        <div className="flex flex-col gap-px rounded-[4px] overflow-hidden">
          <div className="bg-background-200 box-border flex gap-1 items-center justify-start p-3">
            <p className="text-foreground-400 text-xs font-semibold tracking-[0.24px]">
              Sending
            </p>
          </div>

          <TokenCard
            image={token?.metadata.image}
            title={token?.metadata.name}
            amount={formattedAmount}
            value={
              amount && token?.balance.value
                ? formatUsdValue(
                    (Number(amount) *
                      (token.balance.value / token.balance.amount)) /
                      Number(10n ** BigInt(token.metadata.decimals)),
                  )
                : ""
            }
            decreasing
          />

          {(amountError || recipientError) && (
            <div className="mt-2">
              {(amountError && recipientError && (
                <ErrorAlert title="Invalid amount and recipient" />
              )) ||
                (amountError && <ErrorAlert title="Invalid amount" />) ||
                (recipientError && <ErrorAlert title="Invalid recipient" />)}
            </div>
          )}
        </div>
      </div>
    </ExecutionContainer>
  );
}
