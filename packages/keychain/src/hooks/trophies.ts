import { useState } from "react";
import {
  Project,
  useAchievementsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { RawTrophy, Trophy, getSelectorFromTag } from "@/models";

interface Response {
  items: { achievements: RawTrophy[] }[];
}

export function useTrophies({
  namespace,
  name,
  project,
  parser,
}: {
  namespace: string;
  name: string;
  project: string;
  parser: (node: RawTrophy) => Trophy;
}) {
  const [trophies, setTrophies] = useState<{ [key: string]: Trophy }>({});

  // Fetch achievement creations from raw events
  const projects: Project[] = [
    { model: getSelectorFromTag(namespace, name), namespace, project },
  ];
  const { status } = useAchievementsQuery(
    {
      projects,
    },
    {
      enabled: !!namespace && !!project,
      queryKey: ["achievements", namespace, name, project],
      refetchOnWindowFocus: false,
      onSuccess: ({ achievements }: { achievements: Response }) => {
        const items = achievements.items;
        if (items.length === 0) return;
        const rawTrophies = items[0].achievements
          .map(parser)
          .reduce((acc: { [key: string]: Trophy }, achievement: Trophy) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        // Merge trophies
        const values: { [id: string]: Trophy } = {};
        Object.values(rawTrophies).forEach((trophy) => {
          if (Object.keys(values).includes(trophy.id)) {
            trophy.tasks.forEach((task) => {
              if (!values[trophy.id].tasks.find((t) => t.id === task.id)) {
                values[trophy.id].tasks.push(task);
              }
            });
          } else {
            values[trophy.id] = trophy;
          }
        });
        setTrophies(values);
      },
    },
  );

  return { trophies, status };
}
