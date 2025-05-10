import { ThumbnailCollectible } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectibleAssetCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleAssetCardVariants> {
  image: string;
  title: string;
  description: string;
}

const collectibleAssetCardVariants = cva("w-full px-4 py-3 flex gap-3", {
  variants: {
    variant: {
      default: "bg-background-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function CollectibleAssetCard({
  image,
  title,
  description,
  variant,
  className,
  ...props
}: CollectibleAssetCardProps) {
  return (
    <div
      className={cn(collectibleAssetCardVariants({ variant }), className)}
      {...props}
    >
      <ThumbnailCollectible image={image} size="lg" />
      <div className="flex flex-col gap-0.5 justify-between">
        <p className="text-medium text-sm text-foreground-100">{title}</p>
        <p className="text-foreground-300 text-xs">{description}</p>
      </div>
    </div>
  );
}

export default CollectibleAssetCard;
