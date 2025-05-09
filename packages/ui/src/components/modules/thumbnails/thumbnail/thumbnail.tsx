import { ErrorAlertIcon, SpinnerIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { PLACEHOLDER } from "@/assets";

export const thumbnailVariants = cva(
  "relative flex items-center justify-center text-foreground-100 rounded-md data-[rounded=true]:rounded-full data-[error=true]:text-destructive-100",
  {
    variants: {
      variant: {
        darkest:
          "bg-background-100 data-[transdark=true]:bg-translucent-dark-300 data-[translight=true]:bg-translucent-light-100",
        darker:
          "bg-background-100 data-[transdark=true]:bg-translucent-dark-200 data-[translight=true]:bg-translucent-light-100",
        dark: "bg-background-100 data-[transdark=true]:bg-translucent-dark-200 data-[translight=true]:bg-translucent-light-150",
        default:
          "bg-background-200 data-[transdark=true]:bg-translucent-dark-150 data-[translight=true]:bg-translucent-light-150",
        light:
          "bg-background-300 data-[transdark=true]:bg-translucent-dark-150 data-[translight=true]:bg-translucent-light-200",
        lighter:
          "bg-background-400 data-[transdark=true]:bg-translucent-dark-100 data-[translight=true]:bg-translucent-light-200",
        lightest:
          "bg-background-500 data-[transdark=true]:bg-translucent-dark-100  data-[translight=true]:bg-translucent-light-300",
        ghost: "bg-transparent",
      },
      size: {
        xs: "w-5 h-5 min-w-5 min-h-5 p-0.5 data-[centered=true]:p-[2px]",
        sm: "w-6 h-6 min-w-6 min-h-6 p-0.5 data-[centered=true]:p-[3px]",
        md: "w-8 h-8 min-w-8 min-h-8 p-0.5 data-[centered=true]:p-[4px]",
        lg: "w-10 h-10 min-w-10 min-h-10 p-[3px] data-[centered=true]:p-[5px]",
        xl: "w-12 h-12 min-w-12 min-h-12 p-[3px] data-[centered=true]:p-1.5",
        xxl: "w-20 h-20 min-w-20 min-h-20 p-1 data-[centered=true]:p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ThumbnailProps extends VariantProps<typeof thumbnailVariants> {
  icon?: string | React.ReactNode;
  subIcon?: React.ReactNode;
  rounded?: boolean;
  centered?: boolean;
  loading?: boolean;
  error?: boolean;
  transdark?: boolean;
  translight?: boolean;
  className?: string;
}

export const Thumbnail = ({
  icon,
  subIcon,
  rounded,
  centered,
  loading,
  error,
  transdark,
  translight,
  variant,
  size,
  className,
}: ThumbnailProps) => {
  if (error) {
    return (
      <div
        data-error={error}
        data-centered
        data-transdark={transdark}
        data-translight={translight}
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
        data-transdark={transdark}
        data-translight={translight}
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
      data-transdark={transdark}
      data-translight={translight}
      className={cn(thumbnailVariants({ variant, size }), className)}
    >
      {icon === undefined || null ? (
        <div className="w-full h-full flex aspect-square bg-[image:var(--theme-icon-url)] bg-cover bg-center" />
      ) : typeof icon === "string" ? (
        icon.includes("fa-") ? (
          <div className="w-full h-full flex items-center justify-center p-0.5">
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
              e.currentTarget.src = PLACEHOLDER;
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
