import { JoystickIcon, Thumbnail, ThumbnailsSubIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import ActivityCard, { ActivitySocialWebsite } from "./card";

const activityGameCardVariants = cva(
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

export interface ActivityGameCardProps
  extends VariantProps<typeof activityGameCardVariants> {
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
    />
  );
};

export default ActivityGameCard;
