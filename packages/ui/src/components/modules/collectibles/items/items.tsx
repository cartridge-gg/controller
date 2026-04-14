import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectibleItemsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleItemsVariants> {}

const collectibleItemsVariants = cva(
  "flex flex-col items-stretch gap-3 select-none",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleItems({
  variant,
  className,
  children,
  ...props
}: CollectibleItemsProps) {
  return (
    <div
      className={cn(collectibleItemsVariants({ variant }), className)}
      {...props}
    >
      <div className="px-3 py-1 flex justify-between items-center gap-2 text-foreground-400 font-semibold text-xs tracking-wider pr-16">
        <p className="grow">Owner</p>
        <div className="flex justify-end gap-2 min-w-36">
          <p className="min-w-10">Qty</p>
          <p className="min-w-14">Price</p>
          <p className="min-w-12">Expires</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default CollectibleItems;
