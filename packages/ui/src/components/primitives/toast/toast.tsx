"use client";

import React, { memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { TimesIcon } from "@/components/icons";
import { toast as sonnerToast } from "sonner";

const toastVariants = cva(
  "group pointer-events-auto select-none relative flex w-full items-center justify-between overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive-100 bg-destructive-100 text-destructive-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Close Button Component
interface CloseButtonProps {
  variant?: "default" | "translucent";
  className?: string;
  toastId?: string;
}

export const CloseButton = memo<CloseButtonProps>(
  ({ variant = "default", className, toastId }) => {
    const iconColorClass =
      variant === "translucent"
        ? "text-translucent-dark-200 hover:text-translucent-dark-300"
        : "text-foreground-200 hover:text-foreground";

    return (
      <button
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded transition-colors",
          iconColorClass,
          className,
        )}
        onClick={() => sonnerToast.dismiss(toastId)}
      >
        <TimesIcon size="sm" />
      </button>
    );
  },
);

CloseButton.displayName = "CloseButton";

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  showClose?: boolean;
  toastId?: string;
  // compatibility with controller events
  toasterId?: string;
  safeToClose?: boolean;
  iconUrl?: string;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      children,
      showClose = true,
      toastId,
      toasterId,
      safeToClose,
      iconUrl,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-center justify-between w-full flex-1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {children}
          </div>
          {showClose && (
            <div className="flex-shrink-0 ml-2 px-4">
              <CloseButton
                toastId={toastId}
                variant={variant === "destructive" ? "translucent" : "default"}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);
