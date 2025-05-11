import { PLACEHOLDER } from "@/assets";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { useMemo } from "react";
import DynamicAssetRenderer from "../asset-renderer/dynamicAssetRenderer";

export interface CollectiblePreviewProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectiblePreviewVariants> {
  image: string;
  hover?: boolean;
}

const collectiblePreviewVariants = cva(
  "relative flex items-center justify-center overflow-hidden shrink-0",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        sm: "p-2 h-[128px]",
        md: "p-2 h-[128px]",
        lg: "p-2 h-[200px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const CollectiblePreview = ({
  image,
  hover,
  variant,
  size,
  className,
  ...props
}: CollectiblePreviewProps) => {
  const uri = useMemo(() => {
    if (!image) return PLACEHOLDER;
    return image;
  }, [image]);

  return (
    <div
      className={cn(collectiblePreviewVariants({ variant, size }), className)}
      {...props}
    >
      <div
        className="absolute grow inset-0 blur-[8px] transition-opacity duration-150"
        style={{
          opacity: hover ? 1 : 0.75,
        }}
      >
        <DynamicAssetRenderer
          src={uri}
          enableEmbedStylings={false}
          className={cn("object-cover absolute inset-0 w-full h-full")}
        />
        <div
          className="bg-center bg-cover h-full w-full relative"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.64), rgba(0, 0, 0, 0.64))`,
          }}
        />
      </div>
      <DynamicAssetRenderer
        src={uri}
        data-hover={hover}
        className="object-contain max-h-full max-w-full relative transition duration-150 ease-in-out data-[hover=true]:scale-[1.02]"
        draggable={false}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
      />
    </div>
  );
};

export default CollectiblePreview;
