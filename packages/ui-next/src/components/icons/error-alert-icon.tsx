import { cn } from "@/utils";
import { InfoIcon, WarningIcon, AlertIcon as AlertIconRaw } from "./utility";

export type ErrorAlertIconProps = {
  variant: "info" | "warning" | "error";
  size?: "sm";
  className?: string;
};

export function ErrorAlertIcon({
  variant,
  size = "sm",
  className,
}: ErrorAlertIconProps) {
  switch (variant) {
    case "info":
      return (
        <InfoIcon size={size} className={cn("text-[#005299]", className)} />
      );
    case "warning":
      return (
        <WarningIcon size={size} className={cn("text-[#fac400]", className)} />
      );
    case "error":
      return (
        <AlertIconRaw
          size={size}
          className={cn("text-destructive-100", className)}
        />
      );
  }
}
