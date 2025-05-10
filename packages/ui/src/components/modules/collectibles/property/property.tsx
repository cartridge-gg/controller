import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useCallback } from "react";

export interface CollectiblePropertyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectiblePropertyVariants> {
  name: string;
  value: string;
}

const collectiblePropertyVariants = cva("p-3 flex flex-col gap-2 ", {
  variants: {
    variant: {
      default: "bg-background-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function CollectibleProperty({
  name,
  value,
  variant,
  className,
  ...props
}: CollectiblePropertyProps) {
  const format = useCallback((value: string) => {
    // Replace underscores with spaces
    // Capitalize first letter of each word
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, []);

  return (
    <div
      className={cn(collectiblePropertyVariants({ variant }), className)}
      {...props}
    >
      {name && (
        <p className="text-foreground-300 text-xs font-semibold tracking-wider">
          {format(name)}
        </p>
      )}
      {value && (
        <p className="text-foreground-100 text-xs font-medium">
          {format(value)}
        </p>
      )}
    </div>
  );
}

export default CollectibleProperty;
