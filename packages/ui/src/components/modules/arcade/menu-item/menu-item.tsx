import { SelectItem, TabsTrigger } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { useCallback } from "react";

const arcadeMenuItemVariants = cva(
  "rounded-none flex justify-start items-center gap-1 text-foreground-300 bg-background-200 hover:text-foreground-200 hover:bg-background-300 data-[active=true]:text-primary transition-colors cursor-pointer line-clamp-1",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "min-w-[192px] px-2 py-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeMenuItemProps
  extends VariantProps<typeof arcadeMenuItemVariants> {
  Icon: React.ReactNode;
  value: string;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ArcadeMenuItem = React.forwardRef<
  HTMLButtonElement,
  ArcadeMenuItemProps
>(
  (
    { Icon, value, label, active, className, variant, size, onClick, ...props },
    ref,
  ) => {
    const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    return (
      <TabsTrigger
        value={value}
        className={cn(
          "w-full p-0 flex cursor-pointer select-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none",
          className,
        )}
        ref={ref}
        {...props}
      >
        <SelectItem
          onSelect={onClick}
          onFocus={handleFocus}
          data-active={active}
          value={value}
          simplified
          className={cn(arcadeMenuItemVariants({ variant, size }))}
        >
          <div className={cn("flex justify-start items-center gap-1")}>
            {Icon}
            <p className="font-normal">{label}</p>
          </div>
        </SelectItem>
      </TabsTrigger>
    );
  },
);

export default ArcadeMenuItem;
