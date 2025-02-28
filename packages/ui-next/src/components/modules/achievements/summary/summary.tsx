import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { Card, CardContent } from "#components/primitives";
import { AchievementContentProps } from "../content/content";
import { AchievementPinProps } from "../pin/pin";
import { AchievementProgress } from "../progress/progress";
import {
  ArcadeGameHeader,
  Metadata,
  Socials,
} from "#components/modules/arcade";

export interface AchievementSummaryProps
  extends VariantProps<typeof achievementSummaryVariants> {
  achievements: {
    id: string;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
  }[];
  metadata: Metadata;
  socials?: Socials;
}

const achievementSummaryVariants = cva("border border-transparent", {
  variants: {
    variant: {
      default: "",
      faded: "border-background-200 bg-background-200",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const AchievementSummary = ({
  achievements,
  metadata,
  socials,
  variant,
}: AchievementSummaryProps) => {
  const { points, count } = useMemo(() => {
    let points = 0;
    let count = 0;
    achievements.forEach((a) => {
      if (a.content.tasks?.every((t) => t.count >= t.total)) {
        points += a.content.points;
        count++;
      }
    });
    return { points, count };
  }, [achievements]);

  return (
    <Card className={achievementSummaryVariants({ variant })}>
      <ArcadeGameHeader
        achievements={achievements}
        metadata={metadata}
        socials={socials}
        variant={variant}
      />
      <CardContent className="p-0">
        <AchievementProgress
          count={count}
          total={achievements.length}
          points={points}
          variant={variant}
          completed
        />
      </CardContent>
    </Card>
  );
};
