import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { useExecute } from "@/hooks/execute";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  Skeleton,
  Empty,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { uint256, Call } from "starknet";
import { SendRecipient } from "../../../modules/recipient";
import { useCollection } from "@/hooks/collection";
import { Sending } from "./collection-sending";
import { useEntrypoints } from "@/hooks/entrypoints";
import placeholder from "/placeholder.svg?url";
import { SendHeader } from "./header";
import { toast } from "sonner";
const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";
const TRANSFER_FROM_CAMEL_CASE = "transferFrom";
const TRANSFER_FROM_SNAKE_CASE = "transfer_from";

export function SendCollection() {
  const { address: contractAddress, tokenId } = useParams();

  const [searchParams] = useSearchParams();
  const paramsTokenIds = searchParams.getAll("tokenIds");

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });
  const account = useAccount();
  const address = account?.address || "";
  const { controller } = useConnection();
  const { execute } = useExecute();
  const [recipientValidated, setRecipientValidated] = useState(false);
  const [recipientWarning, setRecipientWarning] = useState<string>();
  const [recipientError, setRecipientError] = useState<Error | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);

  const { navigate } = useNavigation();

  const [to, setTo] = useState("");

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collection, assets, status, refetch } = useCollection({
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

  const onSubmit = useCallback(
    async (to: string) => {
      setSubmitted(true);
      if (
        !contractAddress ||
        !tokenIds ||
        !tokenIds.length ||
        !to ||
        !!recipientError ||
        !entrypoint
      )
        return;
      setLoading(true);
      const calldata = entrypoint.includes("safe") ? [0] : [];
      const calls: Call[] = tokenIds.map((id: string) => {
        const tokenId = uint256.bnToUint256(BigInt(id));
        return {
          contractAddress: contractAddress,
          entrypoint,
          calldata: [address, to, tokenId, ...calldata],
        };
      });

      try {
        const res = await execute(calls);
        if (res?.transaction_hash) {
          toast.success("Transaction submitted successfully!");
          refetch();
        }

        const navigationPath = `../../..?${searchParams.toString()}`;

        navigate(navigationPath);
      } catch (error) {
        console.error("Transaction failed:", error);
        toast.error("Failed to send asset(s)");
      } finally {
        setLoading(false);
      }
    },
    [
      controller,
      tokenIds,
      contractAddress,
      address,
      recipientError,
      entrypoint,
      navigate,
      searchParams,
      refetch,
      execute,
    ],
  );

  const handleCancel = useCallback(() => {
    const navigationPath = `../..?${searchParams.toString()}`;
    navigate(navigationPath);
  }, [navigate, searchParams]);

  const title = useMemo(() => {
    if (!collection || !assets || assets.length === 0) return "";
    if (assets.length > 1) return `${assets.length} ${collection.name}(s)`;
    return assets[0].name;
  }, [collection, assets]);

  const image = useMemo(() => {
    if (!collection || !assets) return placeholder;
    if (assets.length > 1) return collection.imageUrl || placeholder;
    return assets[0].imageUrl || placeholder;
  }, [collection, assets]);

  return (
    <>
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className="p-6 flex flex-col gap-6">
            <SendHeader image={image} title={title} />
            <SendRecipient
              to={to}
              setTo={setTo}
              submitted={submitted}
              setWarning={setRecipientWarning}
              setError={setRecipientError}
              setParentLoading={setRecipientLoading}
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
                variant="secondary"
                type="button"
                className="w-1/3"
                isLoading={loading}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled}
                type="submit"
                className="w-2/3"
                isLoading={loading}
                onClick={() => onSubmit(to)}
              >
                Review
              </Button>
            </div>
          </LayoutFooter>
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
