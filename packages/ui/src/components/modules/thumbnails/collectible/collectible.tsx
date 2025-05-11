import { Thumbnail } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { PLACEHOLDER } from "@/assets";

const thumbnailCollectibleVariants = cva("border-transparent", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
      light: "",
      lighter: "",
      lightest: "",
      ghost: "",
    },
    size: {
      xs: "border-[2px] p-px",
      sm: "border-[2px] p-px",
      md: "border-[2px] p-0.5",
      lg: "border-[3px] p-0.5",
      xl: "border-[3px] p-0.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface ThumbnailCollectibleProps
  extends VariantProps<typeof thumbnailCollectibleVariants> {
  image: string;
  subIcon?: React.ReactNode;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ThumbnailCollectible = ({
  image,
  subIcon,
  error,
  loading,
  variant,
  size,
  className,
}: ThumbnailCollectibleProps) => {
  return (
    <Thumbnail
      icon={
        <>
          <div className="absolute rounded-sm grow inset-0">
            <div
              className="bg-center bg-cover blur-[1px] h-full w-full"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.64), rgba(0, 0, 0, 0.64)), url(${image}), url(${PLACEHOLDER})`,
              }}
            />
          </div>
          <img
            className="object-contain max-h-full max-w-full z-10"
            draggable={false}
            src={image}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </>
      }
      subIcon={subIcon}
      error={error}
      loading={loading}
      variant={variant}
      size={size}
      className={cn(
        thumbnailCollectibleVariants({ variant, size }),
        (loading || error) && "border-0",
        className,
      )}
    />
  );
};

export default ThumbnailCollectible;
