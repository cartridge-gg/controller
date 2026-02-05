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
  WalletType,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { uint256, Call, FeeEstimate } from "starknet";
import { SendRecipient } from "../../../modules/recipient";
import { RecipientCard } from "../../../modules/RecipientCard";
import { useCollection } from "@/hooks/collection";
import { Sending } from "./collection-sending";
import { useEntrypoints } from "@/hooks/entrypoints";
import placeholder from "/placeholder.svg?url";
import { ReviewHeader, SendHeader } from "./header";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useToast } from "@/context/toast";

const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";
const TRANSFER_FROM_CAMEL_CASE = "transferFrom";
const TRANSFER_FROM_SNAKE_CASE = "transfer_from";

export function SendCollection() {
  const { address: contractAddress, tokenId } = useParams();
  const { controller } = useConnection();
  const { goBack } = useNavigation();
  const { toast } = useToast();

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
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [sendConfirmed, setSendConfirmed] = useState(false);

  const [to, setTo] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientWalletType, setRecipientWalletType] = useState<
    WalletType | undefined
  >();

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collection, assets, status } = useCollection({
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
    if (entrypoints.includes(TRANSFER_FROM_SNAKE_CASE)) {
      return TRANSFER_FROM_SNAKE_CASE;
    }
    if (entrypoints.includes(TRANSFER_FROM_CAMEL_CASE)) {
      return TRANSFER_FROM_CAMEL_CASE;
    }
    return null;
  }, [entrypoints]);

  const disabled = useMemo(() => {
    return (
      recipientLoading ||
      (!recipientValidated && !!recipientWarning) ||
      !!recipientError
    );
  }, [recipientValidated, recipientWarning, recipientError, recipientLoading]);

  useEffect(() => {
    setRecipientValidated(false);
  }, [recipientWarning, setRecipientValidated]);

  const onRecipientSelected = useCallback(
    (data: { name: string; address: string; walletType: WalletType }) => {
      setRecipientName(data.name);
      setRecipientWalletType(data.walletType);
    },
    [],
  );

  // Build transactions when send is confirmed
  const transactions = useMemo(() => {
    if (
      !sendConfirmed ||
      !contractAddress ||
      !tokenIds ||
      !tokenIds.length ||
      !to ||
      !!recipientError ||
      !entrypoint
    ) {
      return undefined;
    }

    const calldata = entrypoint.includes("safe") ? [0] : [];
    const calls: Call[] = tokenIds.map((id: string) => {
      const tokenId = uint256.bnToUint256(BigInt(id));
      return {
        contractAddress: contractAddress,
        entrypoint,
        calldata: [address, to, tokenId, ...calldata],
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
  ]);

  const title = useMemo(() => {
    if (!collection || !assets || assets.length === 0) return "";
    if (assets.length > 1) return `${assets.length} ${collection.name}(s)`;
    return assets[0].name;
  }, [collection, assets]);

  const image = useMemo(() => {
    if (!collection || !assets) return placeholder;
    if (assets.length > 1) return collection.imageUrls[0] || placeholder;
    return assets[0].imageUrls[0] || placeholder;
  }, [collection, assets]);

  const submitToast = useCallback(() => {
    toast.marketplace("Assets sent successfully!", {
      action: "sent",
      itemNames: [title],
      itemImages: [image],
      collectionName: title,
    });
  }, [toast, title, image]);

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
        toast.error("Failed to send asset(s)");
        throw error;
      }
    },
    [transactions, controller, goBack, toast, submitToast],
  );

  return (
    <>
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          {sendConfirmed && transactions ? (
            <ExecutionContainer
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
              <div className="p-6 pt-0 flex flex-col gap-6">
                <ReviewHeader />
                <RecipientCard
                  address={to}
                  name={recipientName || undefined}
                  walletType={recipientWalletType}
                />
                <Sending assets={assets} description={collection.name} />
              </div>
            </ExecutionContainer>
          ) : (
            <>
              <LayoutContent>
                <SendHeader image={image} title={title} />
                <SendRecipient
                  to={to}
                  setTo={setTo}
                  submitted={false}
                  setWarning={setRecipientWarning}
                  setError={setRecipientError}
                  setParentLoading={setRecipientLoading}
                  onRecipientSelected={onRecipientSelected}
                />
                <Sending assets={assets} description={collection.name} />
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
    <LayoutContent className="select-none h-full overflow-hidden">
      <Skeleton className="min-h-10 w-full rounded" />
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
