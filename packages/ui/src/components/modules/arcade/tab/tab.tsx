import { TabsTrigger } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const arcadeTabVariants = cva(
  "flex justify-center items-center text-foreground-300 hover:text-foreground-200 data-[active=true]:text-primary transition-colors",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "p-2 pt-[10px] gap-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeTabProps extends VariantProps<typeof arcadeTabVariants> {
  Icon: React.ReactNode;
  value: string;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ArcadeTab = React.forwardRef<HTMLButtonElement, ArcadeTabProps>(
  (
    { Icon, value, label, active, className, variant, size, onClick, ...props },
    ref,
  ) => {
    return (
      <TabsTrigger
        value={value}
        className={cn(
          "p-0 flex flex-col items-center cursor-pointer select-none transition-colors",
          className,
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        <div
          data-active={active}
          className={cn(arcadeTabVariants({ variant, size }))}
        >
          {Icon}
          <p className="font-normal">{label}</p>
        </div>
        <div
          data-active={active}
          className={cn(
            "rounded-full bg-primary h-0.5 w-full translate-y-[1px] text-primary",
            active ? "opacity-100" : "opacity-0",
          )}
        />
      </TabsTrigger>
    );
  },
);

export default ArcadeTab;
