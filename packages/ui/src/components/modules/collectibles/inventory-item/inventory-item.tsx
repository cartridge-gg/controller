import { CollectibleCard, collectibleCardVariants } from "@/index";
import { VariantProps } from "class-variance-authority";

export interface InventoryItemCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardVariants> {
  title: string;
  images: string[];
  // icon?: string | null;
  backgroundColor?: string;
  totalCount?: number;
  listingCount?: number;
  // price?: string | { value: string; image: string } | null;
  // lastSale?: string | { value: string; image: string } | null;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}

export function InventoryItemCard({
  title,
  images,
  // icon,
  backgroundColor,
  totalCount,
  listingCount,
  // price,
  // lastSale,
  selectable = true,
  selected,
  onSelect,
  variant,
  className,
  onError,
  ...props
}: InventoryItemCardProps) {
  return (
    <CollectibleCard
      title={title}
      images={images}
      icon={undefined}
      backgroundColor={backgroundColor}
      totalCount={totalCount && totalCount > 1 ? totalCount : undefined}
      listingCount={listingCount}
      price={undefined}
      lastSale={undefined}
      selected={selected}
      selectable={selectable}
      onSelect={onSelect}
      variant={variant}
      className={className}
      onError={onError}
      {...props}
    />
  );
}

export default InventoryItemCard;
