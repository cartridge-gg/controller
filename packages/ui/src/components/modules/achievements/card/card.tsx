import {
  AchievementBit,
  AchievementBits,
  AchievementContent,
  AchievementContentProps,
  AchievementPagination,
  AchievementPin,
  AchievementPinProps,
  AchievementShare,
  AchievementShareProps,
  Card,
  CardHeader,
  CardTitle,
} from "@/index";
import { cn } from "@/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export interface AchievementCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  achievements: {
    id: string;
    index: number;
    completed: boolean;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
    share?: AchievementShareProps;
  }[];
}

export const AchievementCard = ({
  name,
  achievements,
}: AchievementCardProps) => {
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<number[]>([]);

  const visibles = useMemo(() => {
    return achievements.filter(
      (a) => a.index === page || (a.content.hidden && !a.completed),
    );
  }, [achievements, page]);

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

  useEffect(() => {
    // Set the page to the first uncompleted achievement or 0 if there are none
    const filtereds = achievements.filter(
      (a) => !a.content.hidden || a.completed,
    );
    // Get the unique list of indexes for the achievements in this group
    const pages =
      filtereds.length > 0 ? [...new Set(filtereds.map((a) => a.index))] : [0];
    setPages(pages);
    const page = filtereds.find((a) => !a.completed);
    setPage(page ? page.index : pages[pages.length - 1]);
  }, [achievements]);

  if (visibles.length === 0) return null;

  return (
    <Card>
      <div className="flex flex-row gap-x-px">
        <CardHeader className="grow">
          <CardTitle className="capitalize">{name.toLowerCase()}</CardTitle>
        </CardHeader>
        {pages.length > 1 && (
          <AchievementPagination
            direction="left"
            onClick={handlePrevious}
            disabled={page === pages[0]}
          />
        )}
        {pages.length > 1 && (
          <AchievementPagination
            direction="right"
            onClick={handleNext}
            disabled={page === pages[pages.length - 1]}
          />
        )}
        {pages.length > 1 && (
          <CardHeader>
            <AchievementBits>
              {pages.map((p) => (
                <AchievementBit
                  key={p}
                  completed={achievements
                    .filter((a) => a.index === p)
                    .every((a) => a.completed)}
                  active={p === page}
                  onClick={() => setPage(p)}
                />
              ))}
            </AchievementBits>
          </CardHeader>
        )}
      </div>
      {visibles.map((achievement) => (
        <div key={achievement.id} className="flex gap-x-px">
          <AchievementContent {...achievement.content} />
          <div
            className={cn(
              "flex flex-col gap-y-px",
              !achievement.pin && !achievement.share && "hidden",
            )}
          >
            {achievement.pin && <AchievementPin {...achievement.pin} />}
            {achievement.share && <AchievementShare {...achievement.share} />}
          </div>
        </div>
      ))}
    </Card>
  );
};

export default AchievementCard;
