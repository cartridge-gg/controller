import { useCallback } from "react";
import { CheckboxIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export interface CollectibleSelectedProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleSelectedVariants> {
  size?: "xs" | "sm" | "lg" | "xl" | "collectible";
  selected: boolean;
  onSelect?: () => void;
}

const collectibleSelectedVariants = cva("cursor-pointer w-[40px] h-[40px]", {
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

export function CollectibleSelected({
  size = "collectible",
  selected,
  onSelect,
  variant,
  className,
  ...props
}: CollectibleSelectedProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.();
    },
    [onSelect],
  );

  return (
    <div
      className={cn(collectibleSelectedVariants({ variant }), className)}
      {...props}
    >
      <div
        className="relative cursor-pointer hover:brightness-150 w-full h-full"
        onClick={handleClick}
      >
        <div className="absolute top-[8px] right-[8px] text-foreground-400">
          <CheckboxIcon variant="unchecked-solid" size={size} />
        </div>

        {!selected && (
          <div className="absolute top-[8px] right-[8px] text-foreground-300">
            <CheckboxIcon variant="unchecked-line" size={size} />
          </div>
        )}

        {selected && (
          <>
            <div className="absolute top-[8px] right-[8px]">
              <CheckboxIcon variant="check" size={size} />
            </div>
            <div className="absolute top-[8px] right-[8px] text-foreground-100">
              <CheckboxIcon variant="unchecked-line" size={size} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CollectibleSelected;
