import { Item } from "@/hooks/achievements";
import { Pinned, Empty } from "./pinned";

export function Pinneds({ achievements }: { achievements: Item[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {achievements.map((achievement, index) => (
        <Pinned key={index} icon={achievement.icon} title={achievement.title} />
      ))}
      {Array.from({ length: 3 - achievements.length }).map((_, index) => (
        <Empty key={index} />
      ))}
    </div>
  );
}
