import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { Spinner } from "@/components/spinner";
import { buttonVariants } from "./utils";
import { ExternalIcon } from "@/components/icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isActive?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      isActive,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            status: isActive ? "active" : undefined,
            className,
          }),
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
        {variant === "link" && !isLoading && <ExternalIcon size="sm" />}
      </Comp>
    );
  },
);
Button.displayName = "Button";
