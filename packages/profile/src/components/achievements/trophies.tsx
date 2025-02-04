import { WedgeIcon, cn } from "@cartridge/ui-next";
import { Trophy } from "./trophy";
import { Item } from "@/hooks/achievements";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameModel } from "@bal7hazar/arcade-sdk";

const HIDDEN_GROUP = "HIDDEN";

export function Trophies({
  achievements,
  softview,
  enabled,
  game,
  pins,
}: {
  achievements: Item[];
  softview: boolean;
  enabled: boolean;
  game: GameModel | undefined;
  pins: { [playerId: string]: string[] };
}) {
  const [groups, setGroups] = useState<{ [key: string]: Item[] }>({});

  useEffect(() => {
    const groups: { [key: string]: Item[] } = {};
    achievements.forEach((achievement) => {
      // If the achievement is hidden it should be shown in a dedicated group
      const group =
        achievement.hidden && !achievement.completed
          ? HIDDEN_GROUP
          : achievement.group;
      groups[group] = groups[group] || [];
      groups[group].push(achievement);
      groups[group]
        .sort((a, b) => a.id.localeCompare(b.id))
        .sort((a, b) => a.index - b.index);
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
    <div className="flex flex-col gap-4">
      <Total completed={completed} total={total} />
      <div className="flex flex-col gap-3">
        {Object.entries(groups)
          .filter(([group]) => group !== HIDDEN_GROUP)
          .map(([group, items]) => (
            <Group
              key={group}
              group={group}
              items={items}
              softview={softview}
              enabled={enabled}
              game={game}
              pins={pins}
            />
          ))}
        <Group
          key={HIDDEN_GROUP}
          group={HIDDEN_GROUP}
          items={(groups[HIDDEN_GROUP] || []).sort(
            (a, b) => a.earning - b.earning,
          )}
          softview={softview}
          enabled={enabled}
          game={game}
          pins={pins}
        />
      </div>
    </div>
  );
}

function Group({
  group,
  items,
  softview,
  enabled,
  game,
  pins,
}: {
  group: string;
  items: Item[];
  softview: boolean;
  enabled: boolean;
  game: GameModel | undefined;
  pins: { [playerId: string]: string[] };
}) {
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<number[]>([]);

  const visibles = useMemo(() => {
    return items.filter((a) => a.index === page || (a.hidden && !a.completed));
  }, [items, page]);

  useEffect(() => {
    // Set the page to the first uncompleted achievement or 0 if there are none
    const filtereds = items.filter((a) => !a.hidden || a.completed);
    // Get the unique list of indexes for the achievements in this group
    const pages =
      filtereds.length > 0 ? [...new Set(filtereds.map((a) => a.index))] : [0];
    setPages(pages);
    const page = filtereds.find((a) => !a.completed);
    setPage(page ? page.index : pages[pages.length - 1]);
  }, [items]);

  const handleNext = useCallback(() => {
    const index = pages.indexOf(page);
    const next = pages[index + 1];
    if (!next) return;
    setPage(next);
  }, [page, pages]);

  const handlePrevious = useCallback(() => {
    const index = pages.indexOf(page);
    if (index === 0) return;
    setPage(pages[index - 1]);
  }, [page, pages]);

  if (visibles.length === 0) return null;

  return (
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden">
      <Header
        group={group}
        page={page}
        pages={pages}
        items={items}
        setPage={setPage}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
      />
      {visibles.map((achievement) => (
        <Trophy
          key={achievement.id}
          icon={
            achievement.hidden && !achievement.completed
              ? "fa-trophy"
              : achievement.icon
          }
          title={
            achievement.hidden && !achievement.completed
              ? "Hidden Achievement"
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
          id={achievement.id}
          softview={softview}
          enabled={enabled}
          tasks={achievement.tasks}
          game={game}
          pins={pins}
        />
      ))}
    </div>
  );
}

function Header({
  group,
  page,
  pages,
  items,
  setPage,
  handleNext,
  handlePrevious,
}: {
  group: string;
  page: number;
  pages: number[];
  items: Item[];
  setPage: (page: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}) {
  return (
    <div className="flex gap-x-px items-center h-10">
      <div className="grow h-full p-3 bg-background-100 flex items-center">
        <p className="uppercase text-xs text-muted-foreground font-bold tracking-wider">
          {group}
        </p>
      </div>
      {pages.length > 1 && (
        <>
          <Pagination
            icon={<WedgeIcon variant="left" size="sm" />}
            onClick={handlePrevious}
            disabled={page === pages[0]}
          />
          <Pagination
            icon={<WedgeIcon variant="right" size="sm" />}
            onClick={handleNext}
            disabled={page === pages[pages.length - 1]}
          />
          <div className="flex items-center justify-center h-full p-3 bg-background-100 gap-2">
            <div className="flex items-center justify-center rounded-xl bg-background-200 p-[3px]">
              <div className="flex items-center justify-center rounded-xl overflow-hidden gap-x-px">
                {pages.map((current) => (
                  <Page
                    key={current}
                    index={current}
                    completed={items
                      .filter((a) => a.index === current)
                      .every((a) => a.completed)}
                    highlighted={current === page}
                    setPage={setPage}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Pagination({
  icon,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-full w-10 bg-background-100",
        !disabled && "cursor-pointer hover:opacity-70",
      )}
      onClick={onClick}
    >
      <div className="text-muted-foreground">{icon}</div>
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
  return (
    <div
      className={cn(
        "bg-primary h-[10px] w-[10px] opacity-50 hover:cursor-pointer hover:opacity-100",
        completed ? "bg-primary" : "bg-muted",
        highlighted && "opacity-100",
      )}
      onClick={() => setPage(index)}
    />
  );
}

function Total({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="h-8 py-2 px-3 flex items-center justify-between gap-4 rounded-md overflow-hidden">
      <p className="uppercase text-xs text-muted-foreground font-semibold tracking-wider">
        Total
      </p>
      <div className="h-4 grow flex flex-col justify-center items-start bg-background-200 rounded-xl p-1">
        <div
          style={{ width: `${Math.floor((100 * completed) / total)}%` }}
          className={cn("grow bg-primary rounded-xl")}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {`${completed} of ${total}`}
      </p>
    </div>
  );
}
