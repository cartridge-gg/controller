"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva, VariantProps } from "class-variance-authority";
import { CaratIcon, CircleCheckIcon } from "@/components/icons";
import { cn } from "@/utils";

export const selectVariants = cva("", {
  variants: {
    variant: {
      default: "text-xs",
      input: "text-sm/[18px] font-mono",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type SelectVariant = NonNullable<
  VariantProps<typeof selectVariants>["variant"]
>;

export const selectTriggerVariants = cva(
  "flex w-full items-center justify-between whitespace-nowrap rounded-md bg-background-200 hover:bg-background-300 px-3 py-2 text-foreground placeholder:text-foreground-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        default: "h-9 font-bold",
        input:
          "h-10 border border-background-300 hover:bg-background-200 hover:border-background-400 focus:border-primary focus:bg-background-300 data-[state=open]:border-primary data-[state=open]:bg-background-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const selectViewportVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "gap-px font-bold",
      input: "divide-y divide-spacer-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const selectItemVariants = cva(
  "relative flex w-full cursor-default select-none items-center outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-sm py-1.5 pl-2 pr-8 text-foreground-400",
        input:
          "px-4 py-3 focus:bg-background-300 text-foreground-300 focus:text-foreground-100 data-[state=checked]:text-foreground-100",
      },
      simplified: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        simplified: false,
        className: "focus:bg-background-500 focus:text-foreground-200",
      },
    ],
    defaultVariants: {
      variant: "default",
      simplified: false,
    },
  },
);

const SelectVariantContext = React.createContext<SelectVariant>("default");

type SelectProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Root
> & {
  variant?: SelectVariant;
};

const Select = ({ variant, ...props }: SelectProps) => (
  <SelectVariantContext.Provider value={variant ?? "default"}>
    <SelectPrimitive.Root {...props} />
  </SelectVariantContext.Provider>
);
Select.displayName = "Select";

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    simplified?: boolean;
    arrow?: boolean;
  }
>(({ className, children, simplified, arrow, ...props }, ref) => {
  const variant = React.useContext(SelectVariantContext);
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        selectTriggerVariants({ variant }),
        selectVariants({ variant }),
        arrow && "relative",
        className,
      )}
      {...props}
    >
      {children}
      {simplified && (
        <SelectPrimitive.Icon asChild>
          <CaratIcon variant="down" className="text-foreground-400" />
        </SelectPrimitive.Icon>
      )}
      {arrow && (
        <SelectPrimitive.Icon asChild>
          <CaratIcon
            variant="down"
            className="absolute right-3 top-1/2 -translate-y-1/2 shrink-0 text-foreground-300 pointer-events-none"
          />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <CaratIcon variant="up" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <CaratIcon variant="down" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    viewPortClassName?: string;
  }
>(
  (
    { className, viewPortClassName, children, position = "popper", ...props },
    ref,
  ) => {
    const variant = React.useContext(SelectVariantContext);
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden rounded-md bg-background-200 text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className,
          )}
          position={position}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              selectViewportVariants({ variant }),
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
              viewPortClassName,
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    simplified?: boolean;
  }
>(({ className, children, simplified, ...props }, ref) => {
  const variant = React.useContext(SelectVariantContext);
  const showIndicator = !simplified && variant !== "input";
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        selectItemVariants({ variant, simplified: !!simplified }),
        selectVariants({ variant }),
        className,
      )}
      {...props}
    >
      {showIndicator && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <CircleCheckIcon size="sm" />
          </SelectPrimitive.ItemIndicator>
        </span>
      )}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-background-200", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
