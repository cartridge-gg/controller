import { CheckboxCheckedIcon, CheckboxUncheckedIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes, useCallback, useEffect } from "react";

const marketplacePropertyFilterVariants = cva(
  "h-8 flex justify-between items-center px-3 py-1.5 rounded cursor-pointer transition-colors duration-150",
  {
    variants: {
      variant: {
        default:
          "bg-transparent hover:bg-background-200 text-background-500 data-[selected=true]:text-foreground-200 data-[disabled=true]:text-foreground-400 data-[disabled=true]:cursor-default",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplacePropertyFilterProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplacePropertyFilterVariants> {
  label: string;
  count: number;
  value?: boolean;
  setValue?: (value: boolean) => void;
  disabled?: boolean;
}

export const MarketplacePropertyFilter = React.forwardRef<
  HTMLDivElement,
  MarketplacePropertyFilterProps
>(({ label, count, value, setValue, disabled, className, variant }, ref) => {
  const [selected, setSelected] = React.useState<boolean>(!!value);

  const handleClick = useCallback(
    (value: boolean) => {
      setSelected(value);
      if (!setValue) return;
      setValue(value);
    },
    [setValue, setSelected],
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  return (
    <div
      ref={ref}
      data-selected={selected}
      data-disabled={disabled}
      className={cn(marketplacePropertyFilterVariants({ variant }), className)}
      onClick={() => !disabled && handleClick(!selected)}
    >
      <div className="flex items-center gap-2">
        {selected ? (
          <CheckboxCheckedIcon
            data-disabled={disabled}
            size="sm"
            className="text-foreground-400 data-[disabled=true]:text-background-500"
          />
        ) : (
          <CheckboxUncheckedIcon
            data-disabled={disabled}
            size="sm"
            className="text-foreground-400 data-[disabled=true]:text-background-500"
          />
        )}
        <p
          data-disabled={disabled}
          className="text-xs text-foreground-100 data-[disabled=true]:text-foreground-400"
        >
          {label}
        </p>
      </div>
      <p
        data-disabled={disabled}
        className="text-xs text-foreground-100 data-[disabled=true]:text-foreground-400"
      >
        {count}
      </p>
    </div>
  );
});

export default MarketplacePropertyFilter;
