import { AchievementSocial, cn, GlobeIcon, VerifiedIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

const activityCardVariants = cva(
  "rounded p-3 pr-4 flex items-center justify-between gap-4 text-foreground-100 data-[loading]:text-foreground-300 data-[error]:text-destructive-100",
  {
    variants: {
      variant: {
        default: "bg-background-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActivityCardProps
  extends VariantProps<typeof activityCardVariants> {
  Logo: React.ReactNode;
  title: string;
  subTitle: string | React.ReactNode;
  topic?: string;
  subTopic?: string | React.ReactNode;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityCard = ({
  Logo,
  title,
  subTitle,
  topic,
  subTopic,
  error,
  loading,
  variant,
  className,
}: ActivityCardProps) => {
  return (
    <div
      data-loading={loading}
      data-error={error}
      className={cn(activityCardVariants({ variant }), className)}
    >
      {Logo}
      <div className="flex flex-col gap-0.5 items-start grow">
        <p className="text-sm font-medium">{title}</p>
        <div
          data-error={error}
          className="flex text-foreground-300 text-xs data-[error]:text-destructive-100"
        >
          {subTitle}
        </div>
      </div>
      {(!!topic || !!subTopic) && (
        <div
          data-error={error}
          className="flex flex-col gap-0.5 items-end data-[error]:text-destructive-100"
        >
          {!!topic && <p className="text-sm font-medium">{topic}</p>}
          {!!subTopic && (
            <div
              data-error={error}
              className="flex text-foreground-300 text-xs data-[error]:text-destructive-100"
            >
              {subTopic}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ActivitySocialWebsite = ({
  website,
  certified,
  className,
}: {
  website: string;
  certified?: boolean;
  className?: string;
}) => {
  const label = useMemo(() => {
    return website.replace(/^.*https?:\/\//, "").replace(/\/$/, "");
  }, [website]);

  const Icon = useMemo(() => {
    if (certified) {
      return <VerifiedIcon size="xs" />;
    }
    return <GlobeIcon variant="line" size="xs" />;
  }, [certified]);

  return (
    <AchievementSocial
      icon={Icon}
      href={website}
      label={label}
      variant="default"
      className={cn("text-inherit p-0", className)}
    />
  );
};

export default ActivityCard;
