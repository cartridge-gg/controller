import { useNavigation } from "@/context";
import { useQuestContext, type QuestProps } from "@/context/quest";
import { useAccount } from "@/hooks/account";
import {
  LayoutContent,
  Empty,
  Skeleton,
  cn,
  AchievementTask,
  ClockIcon,
  GiftIcon,
  Button,
} from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

export function Quests() {
  const account = useAccount();
  const { quests, status } = useQuestContext();
  const { navigate } = useNavigation();

  const filteredQuests = useMemo(() => {
    return quests.filter((quest) => !quest.locked && !quest.claimed);
  }, [quests]);

  const onClaim = useCallback(
    (quest: QuestProps) => {
      if (!account?.username) return;
      navigate(`/account/${account.username}/quests/${quest?.id}/claim`, {
        replace: false,
        reset: false,
      });
    },
    [navigate, account],
  );

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !quests.length ? (
    <EmptyState />
  ) : (
    <LayoutContent className="select-none h-auto">
      <div className="flex flex-col gap-px border border-background-200 bg-background-200 rounded-lg w-full">
        {filteredQuests.map((quest, index) => (
          <QuestCard
            key={index}
            quest={quest}
            first={index === 0}
            last={index === filteredQuests.length - 1}
            onClaim={() => onClaim(quest)}
          />
        ))}
      </div>
    </LayoutContent>
  );
}

const QuestCard = ({
  quest,
  first,
  last,
  onClaim,
}: {
  quest: QuestProps;
  first: boolean;
  last: boolean;
  onClaim: () => void;
}) => {
  const hidden = useMemo(() => {
    return (
      !quest.completed &&
      quest.end > 0 &&
      quest.end < new Date().getTime() / 1000
    );
  }, [quest]);

  if (hidden) return null;

  return (
    <div
      className={cn(
        "h-[92px] w-full border-l-[6px] border-background-200 flex gap-px",
        quest.completed ? "border-primary-100" : "",
        first ? "rounded-t-lg" : "",
        last ? "rounded-b-lg" : "",
      )}
    >
      <div className="flex flex-col gap-2 p-3 pl-5 bg-background-100 grow">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{quest.name}</h3>
          {quest.end > 0 && !quest.completed && (
            <QuestCountdown end={quest.end} />
          )}
        </div>
        <AchievementTask
          description={quest.tasks[0].description}
          count={Number(quest.tasks[0].count)}
          total={Number(quest.tasks[0].total)}
          completed={quest.completed}
        />
      </div>
      {quest.completed && (
        <QuestClaim claimed={quest.claimed} onClick={onClaim} />
      )}
    </div>
  );
};

const QuestClaim = ({
  claimed,
  onClick,
}: {
  claimed: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      disabled={claimed}
      variant="secondary"
      className="h-full flex justify-center items-center px-2 bg-background-150 hover:bg-background-200 transition-all duration-150 ease-in-out text-primary-100"
      onClick={onClick}
    >
      <GiftIcon variant="solid" size="sm" />
    </Button>
  );
};

const QuestCountdown = ({ end }: { end: number }) => {
  const [time, setTime] = useState<number>(
    (end * 1000 - new Date().getTime()) / 1000,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((end * 1000 - new Date().getTime()) / 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [end]);

  const format = useCallback((time: number) => {
    const months = Math.floor(time / 2592000);
    const days = Math.floor((time % 2592000) / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    if (months > 0) return `${months}mo ${days}d`;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }, []);

  return (
    <div className="flex gap-1 bg-background-200 px-2 py-0.5 rounded-full">
      <ClockIcon variant="line" size="xs" />
      <p className="font-bold font-ld text-xs tracking-widest">
        {format(time)}
      </p>
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
