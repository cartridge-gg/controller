import { cn } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const thumbnailCollectibleVariants = cva(
  "relative rounded-md flex items-center justify-center select-none border border-transparent",
  {
    variants: {
      variant: {
        default: "bg-background-300 text-foreground-100",
        faded: "bg-background-200 text-foreground-100",
      },
      size: {
        sm: "w-6 h-6 p-px",
        md: "w-10 h-10 p-px",
        lg: "w-11 h-11 p-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ThumbnailCollectibleProps
  extends VariantProps<typeof thumbnailCollectibleVariants> {
  image: string;
  subIcon?: React.ReactNode;
  className?: string;
}

export const ThumbnailCollectible = ({
  image,
  subIcon,
  variant,
  size,
  className,
}: ThumbnailCollectibleProps) => {
  return (
    <div
      className={cn(thumbnailCollectibleVariants({ variant, size }), className)}
    >
      <div
        className={cn(
          "absolute rounded-sm grow",
          size === "lg" ? "inset-0.5" : "inset-px",
        )}
      >
        <div
          className="bg-center bg-cover blur-[1px] h-full w-full"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.64), rgba(0, 0, 0, 0.64)), url(${image}), url("/public/placeholder.svg")`,
          }}
        />
      </div>
      <img
        className="object-contain rounded-xs transition h-[89%] w-[89%] z-10"
        draggable={false}
        src={image}
        onError={(e) => {
          e.currentTarget.src = "/public/placeholder.svg";
        }}
      />
      {subIcon && (
        <div className="absolute top-3/4 left-3/4 z-20 -translate-y-1/4 -translate-x-1/4">
          {subIcon}
        </div>
      )}
    </div>
  );
};

export default ThumbnailCollectible;
