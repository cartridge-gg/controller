import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StateIconProps,
  cn,
} from "@cartridge/ui-next";
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
      <div className="h-8 bg-secondary py-2 px-3 flex items-center justify-between gap-4 rounded-md overflow-hidden">
        <p className="uppercase text-xs text-quaternary-foreground font-semibold tracking-wider">
          Total
        </p>
        <div className="h-4 grow flex flex-col justify-center items-start bg-quaternary rounded-xl p-1">
          <div
            style={{ width: `${Math.floor((100 * completed) / total)}%` }}
            className={cn("grow bg-primary rounded-xl")}
          />
        </div>
        <p className="text-xs text-quaternary-foreground">
          {`${completed} of ${total}`}
        </p>
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Set the page to the first uncompleted achievement or 0 if there are none
    // Remove 1 to get the last completed achievement if softview is enabled
    const page = items.findIndex((a) => !a.completed);
    setPage(page === -1 ? items.length - 1 : page);
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
          total={total}
          items={items}
          setPage={setPage}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
        />
      )}
      {items
        .sort((a, b) => a.index - b.index)
        .filter((a) => a.index === page)
        .map((achievement) => (
          <Achievement
            key={achievement.id}
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
  total,
  items,
  setPage,
  handleNext,
  handlePrevious,
}: {
  group: string;
  page: number;
  total: number;
  items: Item[];
  setPage: (page: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}) {
  return (
    <div className="flex gap-x-px items-center h-8">
      <div className="grow h-full p-3 bg-secondary flex items-center">
        <p className="uppercase text-xs text-quaternary-foreground font-semibold tracking-wider">
          {group}
        </p>
      </div>
      <Pagination
        Icon={ChevronLeftIcon}
        total={total}
        onClick={handlePrevious}
        disabled={page === 0}
      />
      <Pagination
        Icon={ChevronRightIcon}
        total={total}
        onClick={handleNext}
        disabled={page === total - 1}
      />
      <div className="flex items-center justify-center h-full p-3 bg-secondary gap-2">
        <div className="flex items-center justify-center rounded-xl bg-quaternary p-[3px]">
          <div className="flex items-center justify-center rounded-xl overflow-hidden gap-x-px">
            {items.map((item, index) => (
              <Page
                key={index}
                index={index}
                completed={item.completed}
                highlighted={item.index === page}
                setPage={setPage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  Icon,
  onClick,
  disabled,
}: {
  Icon: React.ComponentType<StateIconProps>;
  total: number;
  onClick: () => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center justify-center h-8 w-8 bg-secondary",
        !disabled && "cursor-pointer",
        hover && !disabled && "opacity-70",
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Icon
        className={cn(
          "text-quaternary-foreground h-4 w-4",
          disabled && "opacity-50",
        )}
        variant="solid"
      />
    </div>
  );
}

function Page({
  index,
  completed,
  highlighted,
  setPage,
}: {
  index: number;
  completed: boolean;
  highlighted: boolean;
  setPage: (page: number) => void;
}) {
  const [hover, setHover] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (highlighted) return;
    setHover(true);
  }, [highlighted]);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  return (
    <div
      className={cn(
        "bg-primary h-[10px] w-[10px]",
        hover && "cursor-pointer",
        completed ? "bg-primary" : "bg-muted",
        highlighted || hover ? "opacity-100" : "opacity-50",
      )}
      onClick={() => setPage(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
