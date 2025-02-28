import {
  cn,
  SparklesIcon,
  Thumbnail,
  ThumbnailsSubIcon,
  TrophyIcon,
} from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import ActivityCard, { ActivitySocialWebsite } from "./card";

const activityAchievementCardVariants = cva(
  "rounded p-3 pr-4 flex items-center justify-between gap-4",
  {
    variants: {
      variant: {
        default: "bg-background-200 text-foreground-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActivityAchievementCardProps
  extends VariantProps<typeof activityAchievementCardVariants> {
  title: string;
  topic: string;
  points: number;
  website: string;
  image: string;
  error?: boolean;
  loading?: boolean;
  certified?: boolean;
  className?: string;
}

export const ActivityAchievementCard = ({
  title,
  topic,
  points,
  website,
  image,
  error,
  loading,
  certified,
  variant,
  className,
}: ActivityAchievementCardProps) => {
  const Icon = useMemo(
    () => (
      <TrophyIcon
        className="w-full h-full text-foreground-100"
        variant="solid"
      />
    ),
    [],
  );

  const Logo = useMemo(
    () => (
      <Thumbnail
        icon={image}
        subIcon={<ThumbnailsSubIcon Icon={Icon} />}
        error={error}
        loading={loading}
        size="lg"
        variant="faded"
        className={cn(!error && !loading && "text-primary")}
      />
    ),
    [image, error, loading, Icon],
  );

  const Social = useMemo(() => {
    return <ActivitySocialWebsite website={website} certified={certified} />;
  }, [website, certified]);

  const Points = useMemo(() => {
    return (
      <div className="flex items-center gap-1 text-inherit">
        <SparklesIcon variant="solid" size="xs" />
        <span>{points}</span>
      </div>
    );
  }, [points]);

  return (
    <ActivityCard
      Logo={Logo}
      title={title}
      subTitle={Social}
      topic={topic}
      subTopic={Points}
      error={error}
      loading={loading}
      variant={variant}
      className={className}
    />
  );
};

export default ActivityAchievementCard;
