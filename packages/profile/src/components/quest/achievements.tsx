import { cn } from "@cartridge/ui-next";
import { Achievement } from "./achievement";
import { Item } from ".";
import { useMemo } from "react";

export function Achievements({ achievements }: { achievements: Item[] }) {
  const { completed, total } = useMemo(
    () => ({
      completed: achievements.filter((item) => item.completed).length,
      total: achievements.length,
    }),
    [achievements],
  );

  return (
    <div className="flex flex-col gap-y-px rounded-md overflow-hidden">
      <div className="bg-secondary p-3">
        <p className="uppercase text-xs text-muted-foreground font-semibold tracking-wider">
          Progression
        </p>
      </div>
      <div className="bg-secondary py-2 px-3 flex gap-4">
        <div className="grow flex flex-col justify-center items-start bg-accent rounded-xl p-1">
          <div
            style={{ width: `${Math.floor((100 * completed) / total)}%` }}
            className={cn("grow bg-primary rounded-xl")}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {`${completed} of ${total}`}
        </p>
      </div>
      {achievements.map((achievement, index) => (
        <Achievement
          key={index}
          Icon={achievement.Icon}
          title={
            achievement.hidden ? achievement.hidden_title : achievement.title
          }
          description={
            achievement.hidden
              ? achievement.hidden_description
              : achievement.description
          }
          percentage={achievement.percentage}
          earning={achievement.earning}
          timestamp={achievement.timestamp}
          completed={achievement.completed}
        />
      ))}
    </div>
  );
}
