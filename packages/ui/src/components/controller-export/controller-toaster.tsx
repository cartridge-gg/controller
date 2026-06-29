"use client";

import { useEffect, useMemo } from "react";
import { Toaster as Sonner } from "sonner";
import {
  showErrorToast,
  showSuccessToast,
  showTransactionToast,
  showMarketplaceToast,
  showAchievementToast,
  showNetworkSwitchToast,
} from "./specialized-toasts";
import { useToast, ToasterToast } from "./use-toast";
import {
  ToastPosition,
  ErrorToastOptions,
  SuccessToastOptions,
  TransactionToastOptions,
  MarketplaceToastOptions,
  AchievementToastOptions,
  CONTROLLER_TOAST_MESSAGE_TYPE,
  NetworkSwitchToastOptions,
} from "./types";

type SonnerToasterProps = React.ComponentProps<typeof Sonner> & {
  toasterId?: string;
};

export type ControllerNotificationTypes =
  | "error"
  | "success"
  | "network-switch"
  | "transaction"
  | "marketplace"
  | "achievement";

export function ControllerToaster({
  position = "bottom-right",
  disabledTypes = [],
  collapseTransactions,
  toasterId,
  ...props
}: {
  position?: ToastPosition;
  disabledTypes?: ControllerNotificationTypes[];
  collapseTransactions?: boolean;
  toasterId?: string | undefined;
}) {
  const { toast } = useToast();

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (
        !event.data ||
        typeof event.data !== "object" ||
        !("type" in event.data) ||
        !("options" in event.data)
      ) {
        return;
      }

      const variant =
        event.data.type === CONTROLLER_TOAST_MESSAGE_TYPE
          ? event.data.options.variant
          : undefined;
      if (!variant) return;

      if (variant == "error" && !disabledTypes.includes("error")) {
        const options = event.data.options as ErrorToastOptions;
        toast(
          showErrorToast({
            ...options,
            toasterId,
          }) as ToasterToast,
        );
      } else if (variant == "success" && !disabledTypes.includes("success")) {
        const options = event.data.options as SuccessToastOptions;
        toast(
          showSuccessToast({
            ...options,
            toasterId,
          }) as ToasterToast,
        );
      } else if (
        variant == "network-switch" &&
        !disabledTypes.includes("network-switch")
      ) {
        const options = event.data.options as NetworkSwitchToastOptions;
        toast(
          showNetworkSwitchToast({
            ...options,
            toasterId,
          }) as ToasterToast,
        );
      } else if (
        variant == "transaction" &&
        !disabledTypes.includes("transaction")
      ) {
        const options = event.data.options as TransactionToastOptions;
        toast(
          showTransactionToast({
            ...options,
            isExpanded:
              collapseTransactions !== undefined ? !collapseTransactions : true,
            duration: options.status == "confirming" ? 0 : options.duration,
            toasterId,
          }) as ToasterToast,
        );
      } else if (
        variant == "marketplace" &&
        !disabledTypes.includes("marketplace")
      ) {
        const options = event.data.options as MarketplaceToastOptions;
        toast(
          showMarketplaceToast({
            title: `${options.action[0].toUpperCase()}${options.action.slice(1)}`,
            ...options,
            toasterId,
          }) as ToasterToast,
        );
      } else if (
        variant == "achievement" &&
        !disabledTypes.includes("achievement")
      ) {
        const options = event.data.options as AchievementToastOptions;
        toast(
          showAchievementToast({
            ...options,
            toasterId,
          }) as ToasterToast,
        );
      }
    };
    window.addEventListener("message", eventHandler);
    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [disabledTypes.join(","), collapseTransactions, toasterId]);

  const theme = useMemo(
    () => localStorage.getItem("vite-ui-colorScheme") ?? "system",
    [],
  );

  return (
    <Sonner
      id={toasterId}
      position={position}
      theme={theme as SonnerToasterProps["theme"]}
      className="toaster group"
      duration={1000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-lg",
          description: "group-[.toast]:text-foreground-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-background-200 group-[.toast]:text-foreground-400",
        },
      }}
      {...props}
    />
  );
}
