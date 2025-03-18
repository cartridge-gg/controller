import { cn, CollectiblePreview } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { CollectibleHeader } from "../header";
import { useState } from "react";

export interface CollectibleAssetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleAssetVariants> {
  title: string;
  image: string;
  count: number;
  onSelect?: () => void;
}

const collectibleAssetVariants = cva("rounded overflow-hidden cursor-pointer", {
  variants: {
    variant: {
      default: "",
      faded: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function CollectibleAsset({
  title,
  image,
  count,
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
        label={`${count}`}
        hover={hover}
        variant={variant}
      />
      <CollectiblePreview image={image} hover={hover} size="sm" />
    </div>
  );
}

export default CollectibleAsset;
