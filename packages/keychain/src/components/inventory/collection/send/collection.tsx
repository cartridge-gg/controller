import { useAccount } from "@/hooks/account";
import {
  LayoutContent,
  Skeleton,
  Empty,
  PaperPlaneIcon,
  useDisclosure,
} from "@cartridge/controller-ui";
import { useCallback, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigation } from "@/context/navigation";
import { uint256, Call, FeeEstimate } from "starknet";
import { RecipientCard } from "../../../modules/RecipientCard";
import { useCollection } from "@/hooks/collection";
import { Sending } from "./collection-sending";
import { useEntrypoints } from "@/hooks/entrypoints";
import placeholder from "/placeholder.svg?url";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useToast } from "@/context/toast";
import { SendCollectionDrawer } from "./collection-drawer";

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
  const recipient = searchParams.get("recipient");

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });
  const account = useAccount();
  const address = account?.address || "";

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

  // Build transactions when send is confirmed
  const transactions = useMemo(() => {
    if (
      !contractAddress ||
      !tokenIds ||
      !tokenIds.length ||
      !recipient ||
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
        calldata: [address, recipient, tokenId, ...calldata],
      };
    });

    return calls;
  }, [tokenIds, contractAddress, address, recipient, entrypoint]);

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

  // backward compatibility with Arcade
  // when this page is called without a recipient, open the drawer
  const sendCollectionDisclosure = useDisclosure(true);
  useEffect(() => {
    if (!recipient && !sendCollectionDisclosure.isOpen) {
      sendCollectionDisclosure.onOpen();
    }
  }, [recipient, sendCollectionDisclosure.isOpen]);

  return (
    <>
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <ExecutionContainer
            icon={
              <PaperPlaneIcon
                variant="solid"
                size="lg"
                className="h-[30px] w-[30px]"
              />
            }
            title="Review Transaction"
            transactions={transactions ?? []}
            onSubmit={onSubmitSend}
            buttonText="Send"
          >
            <div className="p-4 pt-2 flex flex-col gap-6">
              {!!recipient && <RecipientCard address={recipient} />}
              <Sending assets={assets} description={collection.name} />
            </div>
          </ExecutionContainer>

          {!recipient && (
            <SendCollectionDrawer
              disclosure={sendCollectionDisclosure}
              contractAddress={contractAddress!}
              tokenIds={tokenIds}
            />
          )}
        </>
      )}
    </>
  );
}

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
