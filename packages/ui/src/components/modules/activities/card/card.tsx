import { GlobeIcon, VerifiedIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

export const activityCardVariants = cva(
  "select-none rounded p-3 pr-4 flex items-center justify-between gap-4 text-foreground-100 data-[loading]:text-foreground-300 data-[error]:text-destructive-100",
  {
    variants: {
      variant: {
        default: "bg-background-200 hover:bg-background-300 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActivityCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof activityCardVariants> {
  Logo: React.ReactNode;
  title: string | React.ReactNode;
  subTitle: string | React.ReactNode;
  topic?: string;
  subTopic?: string | React.ReactNode;
  badge?: string;
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
  badge,
  error,
  loading,
  variant,
  className,
  ...props
}: ActivityCardProps) => {
  return (
    <div
      data-loading={loading}
      data-error={error}
      className={cn(activityCardVariants({ variant }), className)}
      {...props}
    >
      {Logo}
      <div className="flex grow items-center">
        <div className="flex grow flex-col gap-0.5 items-stretch overflow-hidden">
          <div
            data-error={error}
            className="flex items-center gap-6 justify-between text-sm font-medium capitalize data-[error]:text-destructive-100"
          >
            <p>{title}</p>
            {!!topic && <p className="truncate">{topic}</p>}
          </div>
          <div
            data-error={error}
            className="flex items-center gap-1 justify-between text-xs text-foreground-300 data-[error]:text-destructive-100"
          >
            {subTitle}
            {!!subTopic && subTopic}
          </div>
        </div>
        {badge && (
          <div className="text-foreground-300 text-sm border border-background-300 rounded-sm px-1 py-0.5">
            {badge}
          </div>
        )}
      </div>
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
    <div className={cn("select-none flex gap-x-1 items-center", className)}>
      {Icon}
      {label && <p className="text-xs">{label}</p>}
    </div>
  );
};

export default ActivityCard;
