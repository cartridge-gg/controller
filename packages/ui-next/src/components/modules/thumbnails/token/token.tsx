import { cn } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const thumbnailTokenVariants = cva(
  "relative rounded-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-background-300 text-foreground-100",
        faded: "bg-background-200 text-foreground-100",
      },
      size: {
        xs: "w-4 h-4 p-px",
        sm: "w-5 h-5 p-0.5",
        md: "w-6 h-6 p-0.5",
        lg: "w-10 h-10 p-[3px]",
        xl: "w-11 h-11 p-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ThumbnailTokenProps
  extends VariantProps<typeof thumbnailTokenVariants> {
  icon: string | React.ReactNode;
  subIcon?: React.ReactNode;
  className?: string;
}

export const ThumbnailToken = ({
  icon,
  subIcon,
  variant,
  size,
  className,
}: ThumbnailTokenProps) => {
  return (
    <div className={cn(thumbnailTokenVariants({ variant, size }), className)}>
      {typeof icon === "string" ? (
        icon.includes("fa-") ? (
          <div className={cn("w-4/5 h-4/5 fa-solid", icon)} />
        ) : (
          <img src={icon} alt="icon" className="w-full h-full aspect-square" />
        )
      ) : (
        icon
      )}
      {subIcon && (
        <div className="absolute top-3/4 left-3/4 z-20 -translate-y-1/4 -translate-x-1/4">
          {subIcon}
        </div>
      )}
    </div>
  );
};

export default ThumbnailToken;
