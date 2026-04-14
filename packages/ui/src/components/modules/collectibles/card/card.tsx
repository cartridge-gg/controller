import { CollectibleCardFooter, CollectiblePreview } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { CollectibleHeader } from "../header";

export interface CollectibleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardVariants> {
  title: string;
  images: string[];
  icon?: string | null;
  backgroundColor?: string;
  totalCount?: number;
  listingCount?: number;
  price?: string | { value: string; image: string } | null;
  lastSale?: string | { value: string; image: string } | null;
  selectable?: boolean;
  selected?: boolean;
  clickable?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}

export const collectibleCardVariants = cva(
  "group relative grow rounded overflow-hidden border-transparent border-[2px] data-[selected=true]:border-foreground-100 data-[selected=true]:rounded-[10px]",
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

export function CollectibleCard({
  title,
  images,
  icon,
  backgroundColor,
  totalCount,
  listingCount,
  price,
  lastSale,
  selectable = false,
  selected,
  clickable = false,
  onSelect,
  variant,
  className,
  onError,
  ...props
}: CollectibleCardProps) {
  return (
    <div
      data-selected={selected}
      className={cn(
        collectibleCardVariants({ variant }),
        props.onClick !== undefined || clickable
          ? "cursor-pointer"
          : "cursor-default",
        className,
      )}
      {...props}
    >
      <CollectibleHeader
        selectable={selectable}
        selected={selected}
        onSelect={onSelect}
        variant={variant}
      />
      <CollectiblePreview
        title={title}
        icon={icon}
        images={images}
        size="sm"
        totalCount={totalCount}
        listingCount={listingCount}
        onError={onError}
        backgroundColor={backgroundColor}
      />
      <CollectibleCardFooter
        price={price}
        lastSale={lastSale}
        variant={variant}
      />
    </div>
  );
}

export default CollectibleCard;
