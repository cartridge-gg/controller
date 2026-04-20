import { Thumbnail } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectibleCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardFooterVariants> {
  price?: string | { value: string; image: string } | null;
  lastSale?: string | { value: string; image: string } | null;
}

const collectibleCardFooterVariants = cva(
  "px-3 py-2 flex flex-col gap-0.5 text-foreground-400 data-[hidden=true]:hidden",
  {
    variants: {
      variant: {
        default: "bg-background-200 group-hover:bg-background-300",
        faded: "bg-background-100 group-hover:bg-background-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleCardFooter({
  price,
  lastSale,
  variant,
  className,
  ...props
}: CollectibleCardFooterProps) {
  return (
    <div
      data-hidden={price === undefined && lastSale === undefined}
      className={cn(collectibleCardFooterVariants({ variant }), className)}
      {...props}
    >
      <div className="flex justify-between items-center text-[10px]/3">
        <p>Price</p>
        <p>Last Sale</p>
      </div>
      <div className="flex justify-between items-center text-sm font-medium">
        {!!price && typeof price === "string" ? (
          <p className="text-foreground-100">{price}</p>
        ) : !!price && typeof price === "object" ? (
          <Price price={price} />
        ) : (
          <p>--</p>
        )}
        {!!lastSale && typeof lastSale === "string" ? (
          <p className="text-foreground-100">{lastSale}</p>
        ) : !!lastSale && typeof lastSale === "object" ? (
          <Price price={lastSale} />
        ) : (
          <p>--</p>
        )}
      </div>
    </div>
  );
}

function Price({ price }: { price: { value: string; image: string } }) {
  return (
    <div className="flex items-center gap-1">
      <Thumbnail
        icon={price.image}
        variant="lighter"
        size="xs"
        rounded
        transdark
      />
      <p className="text-foreground-100">{price.value}</p>
    </div>
  );
}

export default CollectibleCardFooter;
