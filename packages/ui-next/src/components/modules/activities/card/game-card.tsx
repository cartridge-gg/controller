import { JoystickIcon, Thumbnail, ThumbnailsSubIcon } from "@/index";
import { VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import ActivityCard, {
  ActivitySocialWebsite,
  activityCardVariants,
} from "./card";

export interface ActivityGameCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityCardVariants> {
  title: string;
  website: string;
  image: string;
  error?: boolean;
  loading?: boolean;
  certified?: boolean;
  className?: string;
}

export const ActivityGameCard = ({
  title,
  website,
  image,
  error,
  loading,
  certified,
  variant,
  className,
  ...props
}: ActivityGameCardProps) => {
  const Icon = useMemo(
    () => <JoystickIcon className="w-full h-full" variant="solid" />,
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
        variant={loading || error ? "faded" : undefined}
      />
    ),
    [image, error, loading, Icon],
  );

  const Social = useMemo(() => {
    return <ActivitySocialWebsite website={website} certified={certified} />;
  }, [website, certified]);

  return (
    <ActivityCard
      Logo={Logo}
      title={title}
      subTitle={Social}
      error={error}
      loading={loading}
      variant={variant}
      className={className}
      {...props}
    />
  );
};

export default ActivityGameCard;
