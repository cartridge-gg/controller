import { useEffect, useMemo, useState } from "react";
import { Project, useProgressionsQuery } from "@cartridge/utils/api/cartridge";
import { Progress, RawProgress, getSelectorFromTag } from "@/models";

interface Response {
  items: { achievements: RawProgress[] }[];
}

export function useProgressions({
  namespace,
  name,
  project,
  parser,
}: {
  namespace: string;
  name: string;
  project: string;
  parser: (node: RawProgress) => Progress;
}) {
  const [rawProgressions, setRawProgressions] = useState<{
    [key: string]: Progress;
  }>({});
  const [progressions, setProgressions] = useState<{ [key: string]: Progress }>(
    {},
  );

  // Fetch achievement creations from raw events
  const projects: Project[] = useMemo(
    () => [{ model: getSelectorFromTag(namespace, name), namespace, project }],
    [namespace, name, project],
  );

  const { refetch: fetchProgressions, isFetching } = useProgressionsQuery(
    {
      projects,
    },
    {
      enabled: !!namespace && !!project,
      queryKey: ["progressions", namespace, name, project],
      refetchInterval: 600_000, // Refetch every 10 minutes
      onSuccess: ({ playerAchievements }: { playerAchievements: Response }) => {
        const progressions = playerAchievements.items[0].achievements
          .map(parser)
          .reduce((acc: { [key: string]: Progress }, achievement: Progress) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        setRawProgressions(progressions);
      },
    },
  );

  useEffect(() => {
    if (!namespace || !project) return;
    try {
      fetchProgressions();
    } catch (error) {
      // Could happen if the indexer is down or wrong url
      console.error(error);
    }
  }, [namespace, project, fetchProgressions]);

  useEffect(() => {
    if (isFetching) return;
    setProgressions(rawProgressions);
  }, [rawProgressions, isFetching]);

  return { progressions };
}
