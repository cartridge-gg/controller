"use client";

import { useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
  showTransactionToast,
  showMarketplaceToast,
  showAchievementToast,
  showNetworkSwitchToast,
} from "@/components/primitives/toast/specialized-toasts";
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
import { SonnerToaster } from "@/components/primitives/sonner";

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
}: {
  position?: ToastPosition;
  disabledTypes?: ControllerNotificationTypes[];
  collapseTransactions?: boolean;
  toasterId?: string | undefined;
}) {
  const { toast } = useToast();

  useEffect(() => {
    const eventHandler = (event: any) => {
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

  return <SonnerToaster position={position} toasterId={toasterId} />;
}
