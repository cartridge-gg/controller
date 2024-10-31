import { ChevronLeftIcon, ChevronRightIcon, cn } from "@cartridge/ui-next";
import { Achievement } from "./achievement";
import { Item } from "@/hooks/achievements";
import { useCallback, useEffect, useMemo, useState } from "react";

export function Achievements({
  achievements,
  softview,
  enabled,
  onPin,
}: {
  achievements: Item[];
  softview: boolean;
  enabled: boolean;
  onPin: (id: string) => void;
}) {
  const [groups, setGroups] = useState<{ [key: string]: Item[] }>({});

  useEffect(() => {
    const groups: { [key: string]: Item[] } = {};
    achievements.forEach((achievement) => {
      groups[achievement.group] = groups[achievement.group] || [];
      groups[achievement.group].push(achievement);
    });
    setGroups(groups);
  }, [achievements]);

  const { completed, total } = useMemo(
    () => ({
      completed: achievements.filter((item) => item.completed).length,
      total: achievements.length,
    }),
    [achievements],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-y-px rounded-md overflow-hidden">
        <div className="h-10 bg-secondary p-3">
          <p className="uppercase text-xs text-quaternary-foreground font-semibold tracking-wider">
            Progression
          </p>
        </div>
        <div className="h-8 bg-secondary py-2 px-3 flex gap-4">
          <div className="grow flex flex-col justify-center items-start bg-quaternary rounded-xl p-1">
            <div
              style={{ width: `${Math.floor((100 * completed) / total)}%` }}
              className={cn("grow bg-primary rounded-xl")}
            />
          </div>
          <p className="text-xs text-quaternary-foreground">
            {`${completed} of ${total}`}
          </p>
        </div>
      </div>
      {Object.entries(groups).map(([group, items]) => (
        <Group
          key={group}
          group={group}
          items={items}
          softview={softview}
          enabled={enabled}
          onPin={onPin}
        />
      ))}
    </div>
  );
}

function Group({
  group,
  items,
  softview,
  enabled,
  onPin,
}: {
  group: string;
  items: Item[];
  softview: boolean;
  enabled: boolean;
  onPin: (id: string) => void;
}) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Set the page to the first uncompleted achievement or 0 if there are none
    // Remove 1 to get the last completed achievement if softview is enabled
    const page = items.findIndex((a) => !a.completed);
    setPage(page === -1 ? items.length - 1 : page);
    // Set the count to the number of completed achievements for this group
    setCount(items.filter((a) => a.completed).length);
    // Set the total to the number of achievements for this group
    setTotal(items.length);
  }, [items]);

  const handleNext = useCallback(() => {
    setPage(Math.min(page + 1, total - 1));
  }, [page, total]);

  const handlePrevious = useCallback(() => {
    setPage(Math.max(page - 1, 0));
  }, [page]);

  return (
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden">
      {items.length > 1 && (
        <Header
          group={group}
          page={page}
          count={count}
          total={total}
          items={items}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
        />
      )}
      {items
        .sort((a, b) => a.index - b.index)
        .filter((a) => a.index === page)
        .map((achievement, index) => (
          <Achievement
            key={index}
            icon={
              achievement.hidden && !achievement.completed
                ? "fa-trophy"
                : achievement.icon
            }
            title={
              achievement.hidden && !achievement.completed
                ? "Hidden Trophy"
                : achievement.title
            }
            description={
              achievement.hidden && !achievement.completed
                ? ""
                : achievement.description
            }
            percentage={achievement.percentage}
            earning={achievement.earning}
            timestamp={achievement.timestamp}
            hidden={achievement.hidden}
            completed={achievement.completed}
            pinned={achievement.pinned}
            id={achievement.id}
            softview={softview}
            enabled={enabled}
            tasks={achievement.tasks}
            onPin={onPin}
          />
        ))}
    </div>
  );
}

function Header({
  group,
  page,
  count,
  total,
  items,
  handleNext,
  handlePrevious,
}: {
  group: string;
  page: number;
  count: number;
  total: number;
  items: Item[];
  handleNext: () => void;
  handlePrevious: () => void;
}) {
  return (
    <div className="flex gap-x-px items-center h-10">
      <div className="grow h-full p-3 bg-secondary">
        <p className="uppercase text-xs text-quaternary-foreground font-semibold tracking-wider">
          {group}
        </p>
      </div>
      <div
        className={cn(
          "flex items-center justify-center h-full p-3 bg-secondary",
          page !== 0 && "cursor-pointer",
        )}
        onClick={handlePrevious}
      >
        <ChevronLeftIcon
          className={cn(
            "text-quaternary-foreground h-4 w-4",
            page === 0 && "opacity-50",
          )}
        />
      </div>
      <div
        className={cn(
          "flex items-center justify-center h-full p-3 bg-secondary",
          page !== total - 1 && "cursor-pointer",
        )}
        onClick={handleNext}
      >
        <ChevronRightIcon
          className={cn(
            "text-quaternary-foreground h-4 w-4",
            page === total - 1 && "opacity-50",
          )}
        />
      </div>
      <div className="flex items-center justify-center h-full p-3 bg-secondary gap-2">
        <div className="flex items-center justify-center rounded-xl bg-quaternary p-1">
          <div className="flex items-center justify-center rounded-xl overflow-hidden gap-x-px">
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "bg-primary h-2 w-2",
                  item.completed ? "bg-primary" : "bg-muted",
                  item.index === page ? "opacity-100" : "opacity-50",
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-quaternary-foreground">{`${count} of ${total}`}</p>
      </div>
    </div>
  );
}
