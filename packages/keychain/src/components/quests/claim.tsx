import { useNavigation } from "@/context";
import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { useQuests } from "@/hooks/quests";
import {
  LayoutContent,
  Empty,
  Skeleton,
  GiftIcon,
  Thumbnail,
} from "@cartridge/ui";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { AllowArray, Call, CallData, FeeEstimate, shortString } from "starknet";
import { ExecutionContainer } from "../ExecutionContainer";
import { useParams } from "react-router-dom";
import { Receiving } from "../purchasenew/receiving";

export function QuestClaim() {
  const { quests, status } = useQuests();
  const { id: questId } = useParams();
  const account = useAccount();
  const { controller } = useConnection();
  const { goBack } = useNavigation();

  const quest = useMemo(() => {
    return quests.find((quest) => quest.id === questId);
  }, [quests, questId]);

  const buildTransactions: AllowArray<Call> | undefined = useMemo(() => {
    if (!quest || !account?.address || !quest.registry) return undefined;
    return [
      {
        contractAddress: quest.registry,
        entrypoint: "quest_claim",
        calldata: CallData.compile({
          player: account.address,
          quest_id: shortString.encodeShortString(quest.id),
          interval_id: quest.intervalId,
        }),
      },
    ];
  }, [quest, account]);

  const onSubmit = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !buildTransactions || !controller) {
        return;
      }

      try {
        await controller.execute(buildTransactions, maxFee);

        toast.success("Quest claimed successfully!", {
          duration: 10000,
        });

        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to claim quest");
        throw error;
      }
    },
    [buildTransactions, controller, goBack],
  );

  return status === "loading" || !buildTransactions ? (
    <LoadingState />
  ) : status === "error" || !quests.length || !quest ? (
    <EmptyState />
  ) : (
    <ExecutionContainer
      title={<Title />}
      transactions={buildTransactions}
      onSubmit={onSubmit}
      buttonText="Claim"
    >
      <LayoutContent>
        <Receiving
          title={"You Received"}
          items={quest.rewards}
          isLoading={false}
          showPrice={true}
        />
      </LayoutContent>
    </ExecutionContainer>
  );
}

const Title = () => {
  return (
    <div className="flex items-center gap-3">
      <Thumbnail icon={<GiftIcon variant="solid" />} size="lg" />
      <span className="text-lg/[22px] font-semibold">Claim Quest</span>
    </div>
  );
};

const LoadingState = () => {
  return (
    <LayoutContent className="gap-px select-none h-full overflow-hidden rounded-lg">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="min-h-[92px] w-full rounded" />
      ))}
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No quests exist for this game."
        icon="inventory"
        className="h-full"
      />
    </LayoutContent>
  );
};
