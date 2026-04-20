import { CollectibleSelected } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export interface CollectibleHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleHeaderVariants> {
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const collectibleHeaderVariants = cva(
  "group h-9 absolute w-full flex gap-2 px-1.5 py-1.5 justify-between items-center text-sm font-medium transition-all duration-150 z-10 bg-transparent",
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

export function CollectibleHeader({
  selectable,
  selected,
  onSelect,
  variant,
  className,
  ...props
}: CollectibleHeaderProps) {
  return (
    <div
      className={cn(collectibleHeaderVariants({ variant }), className)}
      {...props}
    >
      {(selected || selectable) && (
        <CollectibleSelected
          className="absolute top-0 right-0"
          selected={selected ?? false}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

export default CollectibleHeader;
