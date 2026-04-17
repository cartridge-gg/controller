import { CollectibleCard, collectibleCardVariants } from "@/index";
import { VariantProps } from "class-variance-authority";

export interface InventoryCollectionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardVariants> {
  title: string;
  images: string[];
  icon: string | null;
  backgroundColor?: string;
  totalCount?: number;
  // listingCount?: number;
  // price?: string | { value: string; image: string } | null;
  // lastSale?: string | { value: string; image: string } | null;
  // selectable?: boolean;
  // selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}

export function InventoryCollectionCard({
  title,
  images,
  icon,
  backgroundColor,
  totalCount,
  // listingCount,
  // price,
  // lastSale,
  // selectable = true,
  // selected,
  onSelect,
  variant,
  className,
  onError,
  ...props
}: InventoryCollectionCardProps) {
  return (
    <CollectibleCard
      title={title}
      images={images}
      icon={icon}
      backgroundColor={backgroundColor}
      totalCount={totalCount}
      listingCount={undefined}
      price={undefined}
      lastSale={undefined}
      selected={false}
      selectable={false}
      onSelect={onSelect}
      variant={variant}
      className={className}
      onError={onError}
      {...props}
    />
  );
}

export default InventoryCollectionCard;
