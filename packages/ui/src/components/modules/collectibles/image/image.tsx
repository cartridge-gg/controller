import { useEffect, useState } from "react";
import { PLACEHOLDER } from "@/assets";
import { Skeleton, SpinnerIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export interface CollectibleImageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleImageVariants> {
  images: string[];
  loadingSpinner?: boolean;
  loadingSkeleton?: boolean;
  onLoaded?: () => void;
}

const collectibleImageVariants = cva("relative h-full w-full object-contain", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CollectibleImage = ({
  title,
  images,
  loadingSpinner = false,
  loadingSkeleton = false,
  onLoaded,
  variant,
  className,
  onError,
  ...props
}: CollectibleImageProps) => {
  const [displayImage, setDisplayImage] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    if (onLoaded && displayImage !== undefined) {
      onLoaded();
    }
  }, [displayImage]);

  useEffect(() => {
    let isMounted = true;
    let imageIndex = 0;

    const fixBeastDataUri = async (image: string): Promise<string> => {
      let data = image;
      if (data.startsWith("http")) {
        const res = await fetch(image);
        if (res.ok) {
          data = await res.text();
        }
      }
      if (data.includes('width="100width="100%"')) {
        const match = data.match(/data:image\/png;base64,[^)"]+/);
        if (match && match.length > 0) {
          return match[0];
        }
      }
      throw new Error("continue");
    };

    const loadNextImage = () => {
      if (!isMounted) {
        return;
      }
      // end of images list
      if (imageIndex >= images.length) {
        setDisplayImage(PLACEHOLDER);
        return;
      }
      // get current image
      let image = images[imageIndex++];
      if (!image) {
        loadNextImage();
        return;
      }
      if (image.startsWith("ipfs://")) {
        image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const loader = new window.Image();
      loader.onload = () => {
        if (isMounted) {
          setDisplayImage(image);
        }
      };
      loader.onerror = () => {
        // console.warn('CollectibleImage: Error loading image', image);
        fixBeastDataUri(image)
          .then((data) => {
            if (isMounted) {
              setDisplayImage(data);
            }
          })
          .catch((_) => {
            loadNextImage();
          });
      };
      // start loader
      loader.src = image;
    };

    loadNextImage();

    return () => {
      isMounted = false;
    };
  }, [images.join(",")]);

  return (
    <div
      className={cn(collectibleImageVariants({ variant }), className)}
      {...props}
    >
      {displayImage === undefined && loadingSpinner && (
        <SpinnerIcon
          size="xl"
          className="absolute inset-0 m-auto animate-spin"
        />
      )}
      {displayImage === undefined && loadingSkeleton && (
        <Skeleton className="absolute inset-0 full-w full-h" />
      )}
      {displayImage !== undefined && (
        <img
          className="absolute inset-0 object-contain h-full w-full"
          style={{ imageRendering: "pixelated" }}
          draggable={false}
          src={displayImage}
        />
      )}
    </div>
  );
};

export default CollectibleImage;
