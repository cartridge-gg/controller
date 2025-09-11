import { useAccount } from "@/hooks/account";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  Skeleton,
  Empty,
  PaperPlaneIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { Call, uint256, FeeEstimate } from "starknet";
import { SendRecipient } from "../../../modules/recipient";
import { RecipientCard } from "../../../modules/RecipientCard";
import { useCollectible } from "@/hooks/collectible";
import { Sending } from "./collectible-sending";
import placeholder from "/placeholder.svg?url";
import { SendAmount } from "./amount";
import { ReviewHeader, SendHeader } from "./header";
import { useEntrypoints } from "@/hooks/entrypoints";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { toast } from "sonner";

const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";

export function SendCollectible() {
  const { address: contractAddress, tokenId } = useParams();
  const { controller } = useConnection();
  const { goBack } = useNavigation();

  const [searchParams] = useSearchParams();
  const paramsTokenIds = useMemo(() => {
    return searchParams.getAll("tokenIds");
  }, [searchParams]);

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });
  const account = useAccount();
  const address = account?.address || "";
  const [recipientValidated, setRecipientValidated] = useState(false);
  const [recipientWarning, setRecipientWarning] = useState<string>();
  const [recipientError, setRecipientError] = useState<Error | undefined>();
  const [amount, setAmount] = useState<number | undefined>(1);
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);

  const [to, setTo] = useState("");

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collectible, assets, status } = useCollectible({
    contractAddress: contractAddress,
    tokenIds,
  });

  const entrypoint: string | null = useMemo(() => {
    if (entrypoints.includes(SAFE_TRANSFER_FROM_SNAKE_CASE)) {
      return SAFE_TRANSFER_FROM_SNAKE_CASE;
    }
    if (entrypoints.includes(SAFE_TRANSFER_FROM_CAMEL_CASE)) {
      return SAFE_TRANSFER_FROM_CAMEL_CASE;
    }
    return null;
  }, [entrypoints]);

  const disabled = useMemo(() => {
    return (
      recipientLoading ||
      (!recipientValidated && !!recipientWarning) ||
      !!recipientError ||
      !!amountError
    );
  }, [
    recipientValidated,
    recipientWarning,
    recipientError,
    amountError,
    recipientLoading,
  ]);

  useEffect(() => {
    setRecipientValidated(false);
  }, [recipientWarning, setRecipientValidated]);

  // Build transactions when send is confirmed
  const transactions = useMemo(() => {
    if (
      !sendConfirmed ||
      !contractAddress ||
      !tokenIds ||
      !tokenIds.length ||
      !to ||
      !!recipientError ||
      !entrypoint ||
      !amount ||
      !!amountError
    ) {
      return undefined;
    }

    const formattedAmount = uint256.bnToUint256(BigInt(amount));
    // Fill the extra argument in case of safe transfer functions
    const calldata = entrypoint.includes("safe") ? [0] : [];
    const calls: Call[] = (tokenIds as string[]).map((id: string) => {
      const tokenId = uint256.bnToUint256(BigInt(id));
      return {
        contractAddress: contractAddress,
        entrypoint,
        calldata: [address, to, tokenId, formattedAmount, ...calldata],
      };
    });

    return calls;
  }, [
    sendConfirmed,
    tokenIds,
    contractAddress,
    address,
    to,
    recipientError,
    entrypoint,
    amount,
    amountError,
  ]);

  const onSubmitSend = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !transactions || !controller) {
        return;
      }

      try {
        await controller.execute(transactions, maxFee);

        toast.success("Collectibles sent successfully!", {
          duration: 10000,
        });

        // Navigate back to inventory
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to send collectible(s)");
        throw error;
      }
    },
    [transactions, controller, goBack],
  );

  const title = useMemo(() => {
    if (!collectible || !assets || assets.length === 0) return "";
    if (assets.length > 1) return `${assets.length} ${collectible.name}(s)`;
    return assets[0].name;
  }, [collectible, assets]);

  const image = useMemo(() => {
    if (!collectible || !assets) return placeholder;
    if (assets.length > 1) return collectible.imageUrl || placeholder;
    return assets[0].imageUrl || placeholder;
  }, [collectible, assets]);

  const balance = useMemo(() => {
    if (!collectible || !assets || assets.length !== 1) return 0;
    return assets[0].amount;
  }, [collectible, assets]);

  return (
    <>
      {status === "loading" || !collectible || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          {sendConfirmed && transactions ? (
            <ExecutionContainer
              title="Confirm Send"
              icon={
                <PaperPlaneIcon
                  variant="solid"
                  size="lg"
                  className="h-[30px] w-[30px]"
                />
              }
              transactions={transactions}
              onSubmit={onSubmitSend}
              buttonText="Send"
            >
              <div className="p-6 flex flex-col gap-6">
                <ReviewHeader />
                <RecipientCard address={to} />
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground-400">
                    Amount
                  </p>
                  <p className="text-lg font-medium text-foreground-100">
                    {amount}
                  </p>
                </div>
                <Sending assets={assets} description={collectible.name} />
              </div>
            </ExecutionContainer>
          ) : (
            <>
              <LayoutContent className="p-6 flex flex-col gap-6">
                <SendHeader image={image} title={title} />
                <SendRecipient
                  to={to}
                  setTo={setTo}
                  submitted={false}
                  setWarning={setRecipientWarning}
                  setError={setRecipientError}
                  setParentLoading={setRecipientLoading}
                />
                <SendAmount
                  amount={amount}
                  balance={balance}
                  submitted={false}
                  setAmount={setAmount}
                  setError={setAmountError}
                />
                <Sending assets={assets} description={collectible.name} />
              </LayoutContent>

              <LayoutFooter
                className={cn(
                  "relative flex flex-col items-center justify-center gap-y-4 bg-background",
                )}
              >
                <Warning
                  warning={recipientWarning}
                  validated={recipientValidated}
                  setValidated={setRecipientValidated}
                />
                <div className="w-full flex items-center gap-3">
                  <Button
                    disabled={disabled}
                    type="submit"
                    className="w-full"
                    onClick={() => setSendConfirmed(true)}
                  >
                    Review
                  </Button>
                </div>
              </LayoutFooter>
            </>
          )}
        </>
      )}
    </>
  );
}

const Warning = ({
  warning,
  validated,
  setValidated,
}: {
  warning: string | undefined;
  validated: boolean;
  setValidated: (validated: boolean) => void;
}) => {
  return (
    <div
      className={cn(
        "border border-destructive-100 rounded flex items-center gap-2 p-2 cursor-pointer select-none",
        !warning && "hidden",
      )}
      onClick={() => setValidated(!validated)}
    >
      {validated && (
        <CheckboxCheckedIcon className="text-destructive-100 min-h-5 min-w-5 hover:opacity-80" />
      )}
      {!validated && (
        <CheckboxUncheckedIcon className="text-destructive-100 min-h-5 min-w-5 hover:opacity-80" />
      )}
      <p className="text-xs text-destructive-100">{warning}</p>
    </div>
  );
};

const LoadingState = () => {
  return (
    <LayoutContent className="gap-6 select-none h-full overflow-hidden">
      <Skeleton className="min-h-10 w-full rounded" />
      <div className="flex flex-col">
        <Skeleton className="min-h-4 my-3 w-8 rounded" />
        <Skeleton className="min-h-10 w-full rounded" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="min-h-4 my-3 w-8 rounded" />
        <Skeleton className="min-h-10 w-full rounded" />
      </div>
      <Skeleton className="min-h-[109px] w-full rounded" />
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No information found for this asset."
        icon="inventory"
        className="h-full"
      />
    </LayoutContent>
  );
};
