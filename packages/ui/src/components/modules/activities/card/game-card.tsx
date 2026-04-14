import { useMemo } from "react";
import {
  ActivityPreposition,
  CollectibleTag,
  JoystickIcon,
  Thumbnail,
  TransactionIcon,
} from "@/index";
import { VariantProps } from "class-variance-authority";
import ActivityCardRow, { activityCardRowVariants } from "./card-row";

export interface ActivityGameCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityCardRowVariants> {
  action: string; // endpoint
  name: string; // game name
  themeColor: string; // game theme color
  logo?: string; // game logo
  website?: string;
  certified?: boolean;
  timestamp: number;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityGameCard = ({
  action,
  name,
  themeColor,
  logo,
  website,
  certified,
  timestamp,
  error,
  loading,
  variant,
  className,
  ...props
}: ActivityGameCardProps) => {
  const Icon = useMemo(
    () => <JoystickIcon className="w-full h-full" variant="solid" />,
    [],
  );

  const Title = useMemo(() => {
    return (
      <CollectibleTag
        variant="dark"
        className="gap-1 shrink min-w-0 text-inherit"
        style={{ color: !loading && !error ? themeColor : undefined }}
      >
        <TransactionIcon size="2xs" className="flex-none" />
        <p className="truncate capitalize">
          {action.split("_").join(" ").trim()}
        </p>
      </CollectibleTag>
    );
  }, [action]);

  const Preposition = useMemo(() => <ActivityPreposition label="in" />, []);

  const Game = useMemo(() => {
    return (
      <CollectibleTag variant="dark" className="gap-1">
        <Thumbnail
          icon={logo}
          variant="ghost"
          size="xs"
          className="flex-none"
        />
        <p className="truncate">{name}</p>
      </CollectibleTag>
    );
  }, [logo, name]);

  // const Social = useMemo(() => {
  //   return <ActivitySocialWebsite website={website} certified={certified} />;
  // }, [website, certified]);

  return (
    <ActivityCardRow
      icon={Icon}
      logo={undefined}
      items={[Title, Preposition, Game]}
      timestamp={timestamp}
      error={error}
      loading={loading}
      variant={variant}
      className={className}
      {...props}
    />
  );
};

export default ActivityGameCard;
