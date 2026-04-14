import { useMemo } from "react";
import { cn } from "@/utils";
import { CollectibleTag, SparklesIcon, Thumbnail, TrophyIcon } from "@/index";
import { VariantProps } from "class-variance-authority";
import ActivityCardRow, { activityCardRowVariants } from "./card-row";

export interface ActivityAchievementCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityCardRowVariants> {
  topic: string;
  points: number;
  image: string; // achievement image or icon as fa-xxx
  themeColor: string; // game theme color
  logo?: string; // game logo
  certified?: boolean;
  website?: string;
  timestamp: number;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityAchievementCard = ({
  topic,
  points,
  image,
  themeColor,
  logo,
  certified,
  website,
  timestamp,
  error,
  loading,
  variant,
  className,
  ...props
}: ActivityAchievementCardProps) => {
  const Icon = useMemo(
    () => (
      <TrophyIcon
        className="w-full h-full text-foreground-100 flex-none"
        variant="solid"
      />
    ),
    [],
  );

  const Topic = useMemo(() => {
    return (
      <CollectibleTag
        variant="dark"
        className="gap-1 shrink min-w-0 text-inherit"
        style={{ color: !loading && !error ? themeColor : undefined }}
      >
        <Thumbnail
          icon={image}
          variant="ghost"
          size="xs"
          className="flex-none text-inherit"
          rounded
        />
        <p className="truncate shrink">{topic}</p>
      </CollectibleTag>
    );
  }, [image, topic]);

  const Points = useMemo(() => {
    return (
      <CollectibleTag
        variant="dark"
        className="gap-1 shrink min-w-0 text-inherit"
      >
        <SparklesIcon variant="solid" size="xs" className="flex-none" />
        <p>{points}</p>
      </CollectibleTag>
    );
  }, [points]);

  // const Social = useMemo(() => {
  //   return <ActivitySocialWebsite website={website} certified={certified} />;
  // }, [website, certified]);

  return (
    <ActivityCardRow
      icon={Icon}
      logo={logo}
      items={[Topic, Points]}
      timestamp={timestamp}
      error={error}
      loading={loading}
      variant={variant}
      className={cn("hover:bg-background-200 cursor-default", className)}
      {...props}
    />
  );
};

export default ActivityAchievementCard;
