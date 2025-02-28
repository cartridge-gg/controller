import { cn, ErrorAlertIcon, SpinnerIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

export const thumbnailVariants = cva(
  "relative flex items-center justify-center text-foreground-100 rounded-md data-[rounded=true]:rounded-full data-[error=true]:text-destructive-100",
  {
    variants: {
      variant: {
        dark: "bg-background-100",
        faded: "bg-background-200",
        default: "bg-background-300",
        highlight: "bg-background-400",
      },
      size: {
        sm: "w-6 h-6 p-0.5 data-[centered=true]:p-[5px]",
        md: "w-8 h-8 p-0.5 data-[centered=true]:p-[5px]",
        lg: "w-10 h-10 p-[3px] data-[centered=true]:p-1.5",
        xl: "w-12 h-12 p-[3px] data-[centered=true]:p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ThumbnailProps extends VariantProps<typeof thumbnailVariants> {
  icon: string | React.ReactNode;
  subIcon?: React.ReactNode;
  rounded?: boolean;
  centered?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export const Thumbnail = ({
  icon,
  subIcon,
  rounded,
  centered,
  loading,
  error,
  variant,
  size,
  className,
}: ThumbnailProps) => {
  if (error) {
    return (
      <div
        data-error={error}
        data-centered
        className={cn(thumbnailVariants({ variant, size }), className)}
      >
        <ErrorAlertIcon className="w-full h-full" variant="error" />
      </div>
    );
  }
  if (loading) {
    return (
      <div
        data-centered
        className={cn(thumbnailVariants({ variant, size }), className)}
      >
        <SpinnerIcon className="w-full h-full animate-spin" />
      </div>
    );
  }
  return (
    <div
      data-rounded={rounded}
      data-centered={centered}
      className={cn(thumbnailVariants({ variant, size }), className)}
    >
      {typeof icon === "string" ? (
        icon.includes("fa-") ? (
          <div className="w-full h-full flex items-center justify-center p-[3px]">
            <div className={cn("w-4/5 h-4/5 fa-solid", icon)} />
          </div>
        ) : (
          <img
            src={icon}
            alt="icon"
            className={cn(
              "w-full h-full aspect-square",
              rounded ? "rounded-full" : "rounded-sm",
            )}
            onError={(e) => {
              e.currentTarget.src = "/public/placeholder.svg";
            }}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {icon}
        </div>
      )}
      {subIcon && (
        <div className="absolute top-3/4 left-3/4 z-20 -translate-y-1/4 -translate-x-1/4">
          {subIcon}
        </div>
      )}
    </div>
  );
};

export default Thumbnail;
