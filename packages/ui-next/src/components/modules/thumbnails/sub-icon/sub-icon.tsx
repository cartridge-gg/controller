import { cn } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const thumbnailsSubIconVariants = cva(
  "rounded-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-background-300",
        faded: "bg-background-200",
      },
      size: {
        md: "w-5 h-5 p-1",
        lg: "w-6 h-6 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
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
