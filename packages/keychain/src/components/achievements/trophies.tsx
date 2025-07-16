import {
  AchievementCard,
  AchievementFeatured,
  AchievementProgress,
} from "@cartridge/ui";
import { Item } from "@/hooks/achievements";
import { useEffect, useMemo, useState } from "react";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { useAccount } from "@/hooks/account";

const HIDDEN_GROUP = "Hidden";

export function Trophies({
  achievements,
  pinneds,
  softview,
  enabled,
  game,
  edition,
  pins,
  earnings,
}: {
  achievements: Item[];
  pinneds: Item[];
  softview: boolean;
  enabled: boolean;
  game: GameModel | undefined;
  edition: EditionModel | undefined;
  pins: { [playerId: string]: string[] };
  earnings: number;
}) {
  const account = useAccount();
  const address = account?.address || "";
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
      <div className="flex justify-between">
        {pinneds.map((pin) => (
          <AchievementFeatured key={pin.id} icon={pin.icon} title={pin.title} />
        ))}
        {Array.from({ length: 3 - pinneds.length }).map((_, index) => (
          <AchievementFeatured key={index} />
        ))}
      </div>
      <AchievementProgress
        count={completed}
        total={total}
        points={earnings}
        completed
        variant="ghost"
      />
      <div className="flex flex-col gap-4">
        {Object.entries(groups)
          .filter(([group]) => group !== HIDDEN_GROUP)
          .map(([group, items]) => (
            <Group
              key={group}
              address={address}
              group={group}
              items={items}
              softview={softview}
              enabled={enabled}
              game={game}
              edition={edition}
              pins={pins}
            />
          ))}
        <Group
          key={HIDDEN_GROUP}
          address={address}
          group={HIDDEN_GROUP}
          items={(groups[HIDDEN_GROUP] || []).sort(
            (a, b) => a.earning - b.earning,
          )}
          softview={softview}
          enabled={enabled}
          game={game}
          edition={edition}
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
  game,
  edition,
}: {
  group: string;
  address: string;
  items: Item[];
  softview: boolean;
  enabled: boolean;
  game: GameModel | undefined;
  edition: EditionModel | undefined;
  pins: { [playerId: string]: string[] };
}) {
  const achievements = useMemo(() => {
    // Ensure pagination is allowed only for consistent page content
    const uniquePages = Array.from(new Set(items.map((item) => item.index)));
    const countPerPages = new Set(
      uniquePages.map(
        (page) => items.filter((item) => item.index === page).length,
      ),
    );
    const paginationAllowed = countPerPages.size === 1;
    return items.map((item) => {
      return {
        id: item.id,
        index: paginationAllowed ? item.index : 0,
        completed: item.completed,
        content: {
          points: item.earning,
          difficulty: parseFloat(item.percentage),
          hidden: item.hidden,
          icon: item.hidden && !item.completed ? undefined : item.icon,
          title: item.title,
          description: item.description,
          tasks: item.tasks,
          timestamp: item.completed ? item.timestamp : undefined,
        },
        share:
          softview ||
          !item.completed ||
          !edition?.socials.website ||
          !game?.socials.twitter
            ? undefined
            : {
                website: edition?.socials.website,
                twitter: game?.socials.twitter,
                timestamp: item.timestamp,
                points: item.earning,
                difficulty: parseFloat(item.percentage),
                title: item.title,
              },
      };
    });
  }, [items, softview, game, edition]);

  return <AchievementCard name={group} achievements={achievements} />;
}
