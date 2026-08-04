import { Thumbnail } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { PLACEHOLDER } from "@/assets";
import { useEffect, useMemo, useState } from "react";

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
      xxs: "border-[2px] p-px",
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
  image: string | string[];
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
  const displayImage = useFirstLoadableImage(image);
  return (
    <Thumbnail
      icon={
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-sm">
          <div className="absolute inset-0 blur-[1px]">
            <img
              src={displayImage}
              className={cn("object-cover w-full h-full")}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
          </div>
          <div className="absolute inset-0 bg-center bg-cover h-full w-full bg-translucent-dark-300" />
          <img
            className={cn(
              thumbnailCollectibleVariants({ size }),
              "object-contain max-h-full max-w-full z-10 relative border-0",
            )}
            draggable={false}
            src={displayImage}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </div>
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

/**
 * Resolve the first source that actually loads as an image. Torii can serve a
 * 200 response that is not decodable (e.g. token metadata containing a raw URL
 * instead of image data), so each candidate is probed before being displayed.
 */
function useFirstLoadableImage(image: string | string[]): string {
  const sources = useMemo(
    () => (Array.isArray(image) ? image : [image]).filter(Boolean),
    [Array.isArray(image) ? image.join(",") : image],
  );
  const [resolved, setResolved] = useState<string | undefined>(() =>
    sources.length === 1 ? sources[0] : undefined,
  );

  useEffect(() => {
    // Single source keeps the legacy behavior: render it directly and let the
    // <img> onError handlers swap in the placeholder.
    if (sources.length <= 1) {
      setResolved(sources[0] ?? PLACEHOLDER);
      return;
    }
    let isMounted = true;
    let index = 0;
    const loadNext = () => {
      if (!isMounted) return;
      if (index >= sources.length) {
        setResolved(PLACEHOLDER);
        return;
      }
      const source = sources[index++];
      const loader = new window.Image();
      loader.onload = () => {
        if (isMounted) setResolved(source);
      };
      loader.onerror = () => loadNext();
      loader.src = source;
    };
    loadNext();
    return () => {
      isMounted = false;
    };
  }, [sources]);

  return resolved ?? sources[0] ?? PLACEHOLDER;
}

export default ThumbnailCollectible;
