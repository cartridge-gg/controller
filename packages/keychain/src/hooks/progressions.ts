import { useMemo, useState } from "react";
import {
  Project,
  useProgressionsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { Progress, RawProgress, getSelectorFromTag } from "@/models";
import { addAddressPadding } from "starknet";

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
  const [progressions, setProgressions] = useState<{ [key: string]: Progress }>(
    {},
  );

  // Fetch achievement creations from raw events
  const projects: Project[] = useMemo(
    () => [
      {
        model: addAddressPadding(getSelectorFromTag(namespace, name)),
        namespace,
        project,
      },
    ],
    [namespace, name, project],
  );

  const { status } = useProgressionsQuery(
    {
      projects,
    },
    {
      enabled: !!namespace && !!project,
      queryKey: ["progressions", namespace, name, project],
      refetchOnWindowFocus: false,
      onSuccess: ({ playerAchievements }: { playerAchievements: Response }) => {
        const items = playerAchievements.items;
        if (items.length === 0) return;
        const progressions = items[0].achievements
          .map(parser)
          .reduce((acc: { [key: string]: Progress }, achievement: Progress) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        setProgressions(progressions);
      },
    },
  );

  return { progressions, status };
}
