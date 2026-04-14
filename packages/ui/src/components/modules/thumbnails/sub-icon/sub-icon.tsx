import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

const thumbnailsSubIconVariants = cva(
  "rounded-full flex items-center justify-center text-foreground-100",
  {
    variants: {
      variant: {
        darkest: "bg-background-200",
        darker: "bg-background-200",
        dark: "bg-background-200",
        default: "bg-background-300",
        light: "bg-background-300",
        lighter: "bg-background-400",
        lightest: "bg-background-400",
        ghost: "bg-transparent",
      },
      size: {
        lg: "w-5 h-5 p-1",
        xl: "w-6 h-6 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  },
);

export interface ThumbnailsSubIconProps
  extends VariantProps<typeof thumbnailsSubIconVariants> {
  Icon: React.ReactNode;
  className?: string;
}

export const ThumbnailsSubIcon = ({
  Icon,
  variant,
  size,
  className,
}: ThumbnailsSubIconProps) => {
  return (
    <div
      className={cn(thumbnailsSubIconVariants({ variant, size }), className)}
    >
      {Icon}
    </div>
  );
};

export default ThumbnailsSubIcon;
