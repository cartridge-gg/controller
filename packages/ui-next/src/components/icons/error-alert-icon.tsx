import { cn } from "@/utils";
import { InfoIcon, WarningIcon, AlertIcon as AlertIconRaw } from "./utility";

export function ErrorAlertIcon({
  variant,
  size = "default",
  className,
}: {
  variant: "info" | "warning" | "error";
  size?: "xs" | "default";
  className?: string;
}) {
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
