import {
  CollectiblePreview,
  CollectibleTag,
  StackDiamondIcon,
  TagIcon,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { CollectibleHeader } from "../header";
import { useState } from "react";

export interface CollectibleAssetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleAssetVariants> {
  title: string;
  image: string;
  count?: number;
  quantity?: number;
  sales?: number;
  icon?: string | null;
  onSelect?: () => void;
}

const collectibleAssetVariants = cva(
  "relative rounded overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        faded: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleAsset({
  title,
  image,
  count,
  quantity,
  sales,
  icon,
  variant,
  className,
  ...props
}: CollectibleAssetProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-hover={hover}
      className={cn(collectibleAssetVariants({ variant }), className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <CollectibleHeader
        title={title}
        icon={icon}
        label={count ? `${count}` : undefined}
        hover={hover}
        variant={variant}
      />
      <CollectiblePreview image={image} hover={hover} size="sm" />
      <div className="flex gap-1 items-center justify-end absolute bottom-1 right-1">
        {!!quantity && (
          <CollectibleTag label={`${quantity}`}>
            <StackDiamondIcon variant="solid" size="sm" />
          </CollectibleTag>
        )}
        {!!sales && (
          <CollectibleTag label={`${sales}`}>
            <TagIcon variant="solid" size="sm" />
          </CollectibleTag>
        )}
      </div>
    </div>
  );
}

export default CollectibleAsset;
