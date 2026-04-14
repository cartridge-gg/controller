import { ErrorAlertIcon, SpinnerIcon, Thumbnail } from "@/index";
import { cn, getDuration } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { useMemo } from "react";

export const activityCardRowVariants = cva(
  "select-none rounded px-3 py-2.5 flex gap-0.5 text-sm items-center justify-between text-foreground-100 data-[loading]:text-foreground-300 data-[error]:text-destructive-100",
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

export interface ActivityCardRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof activityCardRowVariants> {
  icon: React.ReactNode;
  logo?: React.ReactNode;
  timestamp: number;
  items: (string | React.ReactNode)[];
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityCardRow = ({
  icon,
  logo,
  items,
  timestamp,
  error,
  loading,
  variant,
  className,
  ...props
}: ActivityCardRowProps) => {
  const currentTimestamp = useMemo(() => new Date().getTime(), []);
  return (
    <div
      data-loading={loading}
      data-error={error}
      className={cn(activityCardRowVariants({ variant }), className)}
      {...props}
    >
      <div className="w-6 h-6 p-0 flex-none">{icon}</div>
      {items
        .filter(Boolean)
        .map((item, index) =>
          typeof item === "string" ? (
            <p key={`item-${index}`}>{item}</p>
          ) : React.isValidElement(item) ? (
            React.cloneElement(item, { key: `item-${index}` })
          ) : null,
        )}

      <div className="flex-grow" />

      <div className="text-sm text-foreground-400 mx-1 mb-[1px]">
        {getDuration(currentTimestamp - timestamp)}
      </div>

      {error ? (
        <ErrorAlertIcon className="w-6 h-6 flex-none" variant="error" />
      ) : loading ? (
        <SpinnerIcon className="w-6 h-6 flex-none animate-spin" />
      ) : (
        logo && (
          <div className="w-6 h-6 flex-none">
            <Thumbnail icon={logo} size="sm" />
          </div>
        )
      )}
    </div>
  );
};

export const ActivityPreposition = ({
  label,
}: {
  label: string | undefined | null;
}) => {
  if (!label) {
    return null;
  }
  return (
    <div className="text-sm text-foreground-400 mx-1 mb-[1px]">{label}</div>
  );
};

export default ActivityCardRow;
