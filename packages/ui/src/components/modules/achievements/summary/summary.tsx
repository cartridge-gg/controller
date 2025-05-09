import {
  AchievementContentProps,
  ArcadeGameHeader,
  AchievementPinProps,
  AchievementProgress,
  Card,
  CardContent,
  Metadata,
  Socials,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

export interface AchievementSummaryProps
  extends VariantProps<typeof achievementSummaryVariants> {
  achievements: {
    id: string;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
  }[];
  metadata: Metadata;
  socials?: Socials;
  active?: boolean;
  className?: string;
  color?: string;
}

const achievementSummaryVariants = cva("border border-transparent", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
      light: "",
      lighter: "",
      lightest: "",
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
  active,
  className,
  color,
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
        active={active}
        className={className}
        color={color}
      />
      <CardContent className="p-0">
        <AchievementProgress
          count={count}
          total={achievements.length}
          points={points}
          variant={variant}
          completed
          className={className}
          color={color}
        />
      </CardContent>
    </Card>
  );
};

export default AchievementSummary;
