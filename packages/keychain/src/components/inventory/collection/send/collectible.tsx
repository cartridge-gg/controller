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
import { useToast } from "@/context/toast";
import { Call, uint256, FeeEstimate } from "starknet";
import { RecipientCard } from "../../../modules/RecipientCard";
import { useCollection } from "@/hooks/collection";
import { useEntrypoints } from "@/hooks/entrypoints";
import { useConnection } from "@/hooks/connection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { SendCollectibleDrawer } from "./collectible-drawer";
import { Sending } from "./sending";
import placeholder from "/placeholder.svg?url";

const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";

export function SendCollectible() {
  const { address: contractAddress, tokenId } = useParams();
  const { controller } = useConnection();
  const { goBack } = useNavigation();
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const paramsTokenIds = useMemo(() => {
    return searchParams.getAll("tokenIds");
  }, [searchParams]);
  const recipient = searchParams.get("recipient");
  const amount = Number(searchParams.get("amount") || "1");

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });
  const account = useAccount();
  const address = account?.address || "";

  const tokenIds = useMemo(() => {
    return [...paramsTokenIds, ...(tokenId ? [tokenId] : [])].slice(0, 1);
  }, [tokenId, paramsTokenIds]);

  const {
    collection: collectible,
    assets,
    status,
  } = useCollection({
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

  // Build transactions when send is confirmed
  const transactions = useMemo(() => {
    if (
      !contractAddress ||
      !tokenIds ||
      !tokenIds.length ||
      !recipient ||
      !entrypoint ||
      !amount
    ) {
      return undefined;
    }

    const formattedAmount = uint256.bnToUint256(BigInt(amount));
    const calldata = entrypoint.includes("safe") ? [0] : [];
    const calls: Call[] = tokenIds.map((id: string) => {
      const tokenId = uint256.bnToUint256(BigInt(id));
      return {
        contractAddress: contractAddress,
        entrypoint,
        calldata: [address, recipient, tokenId, formattedAmount, ...calldata],
      };
    });

    return calls;
  }, [tokenIds, contractAddress, address, recipient, entrypoint, amount]);

  const { title, image } = useMemo(() => {
    if (!collectible || !assets || assets.length === 0)
      return { title: "", image: placeholder };
    if (assets.length > 1)
      return {
        title: `${assets.length} ${collectible.name}(s)`,
        image: collectible.imageUrls[0] || placeholder,
      };
    return {
      title: assets[0].name,
      image: assets[0].imageUrls[0] || placeholder,
    };
  }, [collectible, assets]);

  const submitToast = useCallback(() => {
    toast.marketplace("Collectibles sent successfully!", {
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
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to send collectible(s)");
        throw error;
      }
    },
    [transactions, controller, goBack, toast, submitToast],
  );

  // backward compatibility with Arcade
  // when this page is called without a recipient, open the drawer
  const sendDisclosure = useDisclosure(true);
  useEffect(() => {
    if (!recipient && !sendDisclosure.isOpen) {
      goBack();
    }
  }, [recipient, sendDisclosure.isOpen, goBack]);

  return (
    <>
      {status === "loading" || !collectible || !assets ? (
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
            <div className="p-4 pt-2 flex flex-col gap-4">
              {!!recipient && <RecipientCard address={recipient} />}
              {assets?.length > 0 && (
                <Sending
                  assets={new Array(amount).fill(assets[0])}
                  description={collectible.name}
                />
              )}
            </div>
          </ExecutionContainer>

          {!recipient && (
            <SendCollectibleDrawer
              disclosure={sendDisclosure}
              contractAddress={contractAddress!}
              tokenId={tokenId!}
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
