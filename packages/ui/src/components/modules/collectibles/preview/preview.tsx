import { useState } from "react";
import { CollectibleImage, Skeleton, CollectibleFooter } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export interface CollectiblePreviewProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectiblePreviewVariants> {
  title?: string;
  icon?: string | null;
  images: string[];
  totalCount?: number;
  listingCount?: number;
  backgroundColor?: string;
}

const collectiblePreviewVariants = cva(
  "relative flex items-center justify-center overflow-hidden shrink-0 rounded-[8px]",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        sm: "p-[20px] h-[160px]",
        md: "p-[20px] h-[160px]",
        lg: "p-[20px] h-[200px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const CollectiblePreview = ({
  title,
  icon,
  images,
  totalCount,
  listingCount,
  backgroundColor,
  variant,
  size,
  className,
  onError,
  ...props
}: CollectiblePreviewProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={cn(collectiblePreviewVariants({ variant, size }), className)}
      {...props}
    >
      <div className="absolute grow inset-0">
        <div
          className="h-full w-full relative"
          style={{
            backgroundColor: backgroundColor || `#000000`,
          }}
        />
      </div>
      {!loaded && <Skeleton className="absolute inset-0 full-w full-h" />}
      <CollectibleImage
        className="transition duration-150 ease-in-out hover:scale-[1.1]"
        images={images}
        onLoaded={() => setLoaded(true)}
      />
      <CollectibleFooter
        className="absolute bottom-0"
        title={title}
        icon={icon}
        totalCount={totalCount}
        listingCount={listingCount}
        variant={variant}
      />
    </div>
  );
};

export default CollectiblePreview;
