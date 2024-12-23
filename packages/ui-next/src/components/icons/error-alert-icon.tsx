import { cn } from "@/utils";
import { InfoIcon, WarningIcon, AlertIcon as AlertIconRaw } from "./utility";

export type ErrorAlertIconProps = {
  variant: "info" | "warning" | "error";
  size?: "xs" | "default";
  className?: string;
};

export function ErrorAlertIcon({
  variant,
  size = "default",
  className,
}: ErrorAlertIconProps) {
  switch (variant) {
    case "info":
      return (
        <InfoIcon
          size={size}
          className={cn("text-info-foreground", className)}
        />
      );
    case "warning":
      return (
        <WarningIcon
          size={size}
          className={cn("text-warning-foreground", className)}
        />
      );
    case "error":
      return (
        <AlertIconRaw
          size={size}
          className={cn("text-error-foreground", className)}
        />
      );
  }
}
