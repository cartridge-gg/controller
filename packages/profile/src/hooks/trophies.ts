import { useEffect, useState } from "react";
import { Project, useAchievementsQuery } from "@cartridge/utils/api/cartridge";
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
  const [rawTrophies, setRawTrophies] = useState<{ [key: string]: Trophy }>({});
  const [trophies, setTrophies] = useState<{ [key: string]: Trophy }>({});

  // Fetch achievement creations from raw events
  const projects: Project[] = [
    { model: getSelectorFromTag(namespace, name), namespace, project },
  ];
  const { refetch: fetchAchievements, isFetching } = useAchievementsQuery(
    {
      projects,
    },
    {
      enabled: !!namespace && !!project,
      queryKey: ["achievements", namespace, name, project],
      refetchInterval: 600_000, // Refetch every 10 minutes
      onSuccess: ({ achievements }: { achievements: Response }) => {
        const trophies = achievements.items[0].achievements
          .map(parser)
          .reduce((acc: { [key: string]: Trophy }, achievement: Trophy) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        setRawTrophies({ ...trophies });
      },
    },
  );

  useEffect(() => {
    if (!namespace || !project) return;
    try {
      fetchAchievements();
    } catch (error) {
      // Could happen if the indexer is down or wrong url
      console.error(error);
    }
  }, [namespace, project, fetchAchievements]);

  useEffect(() => {
    if (
      isFetching ||
      Object.values(rawTrophies).length === Object.values(trophies).length
    )
      return;
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
  }, [rawTrophies, trophies, isFetching, setTrophies]);

  return { trophies };
}
