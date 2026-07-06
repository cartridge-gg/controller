"use client";

import { useEffect, useMemo } from "react";
import { Toaster as Sonner } from "sonner";
import {
  showErrorToast,
  showSuccessToast,
  showTransactionToast,
  showMarketplaceToast,
  showAchievementToast,
  showNetworkToast,
  showUserToast,
  showSettingToast,
  showCreditsToast,
} from "../toasts/specialized-toasts";
import { useToast, ToasterToast } from "./use-toast";
import { ControllerPresetProvider } from "./preset-provider";
import {
  ToastPosition,
  ErrorToastOptions,
  SuccessToastOptions,
  TransactionToastOptions,
  MarketplaceToastOptions,
  AchievementToastOptions,
  CONTROLLER_TOAST_MESSAGE_TYPE,
  NetworkToastOptions,
  UserToastOptions,
  SettingToastOptions,
  CreditsToastOptions,
} from "../types";

export const CONTROLLER_TOASTER_ID = "controller-toaster";
const TOASTER_POSITION = "bottom-right";
const TOASTER_DURATION = 5000;

export type ControllerNotificationTypes =
  | "error"
  | "success"
  | "network"
  | "transaction"
  | "marketplace"
  | "achievement"
  | "user"
  | "setting"
  | "credits";

type SonnerToasterProps = React.ComponentProps<typeof Sonner>;

// Accepts messages from the same hostname on any port
// (`localhost:1234` / `localhost:6789`) or from sibling subdomains
// (`abc.cartridge.gg` / `xyz.cartridge.gg`).
function getBaseDomain(hostname: string): string {
  return hostname.split(".").slice(-2).join(".");
}
function isTrustedOrigin(origin: string): boolean {
  try {
    const originUrl = new URL(origin);
    const locationUrl = new URL(window.location.origin);
    return (
      originUrl.hostname === locationUrl.hostname ||
      getBaseDomain(originUrl.hostname) === getBaseDomain(locationUrl.hostname)
    );
  } catch {
    return false;
  }
}

export type ControllerToastProps = SonnerToasterProps & {
  duration?: number;
  position?: ToastPosition;
  disabledTypes?: ControllerNotificationTypes[];
  collapseTransactions?: boolean;
};

export function ControllerToaster({
  position = TOASTER_POSITION,
  duration = TOASTER_DURATION,
  disabledTypes = [],
  collapseTransactions,
  ...props
}: ControllerToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (!isTrustedOrigin(event.origin)) {
        return;
      }
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
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (variant == "success" && !disabledTypes.includes("success")) {
        const options = event.data.options as SuccessToastOptions;
        toast(
          showSuccessToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (variant == "network" && !disabledTypes.includes("network")) {
        const options = event.data.options as NetworkToastOptions;
        toast(
          showNetworkToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
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
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        variant == "marketplace" &&
        !disabledTypes.includes("marketplace")
      ) {
        const options = event.data.options as MarketplaceToastOptions;
        toast(
          showMarketplaceToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
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
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (variant == "user" && !disabledTypes.includes("user")) {
        const options = event.data.options as UserToastOptions;
        toast(
          showUserToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (variant == "setting" && !disabledTypes.includes("setting")) {
        const options = event.data.options as SettingToastOptions;
        toast(
          showSettingToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (variant == "credits" && !disabledTypes.includes("credits")) {
        const options = event.data.options as CreditsToastOptions;
        toast(
          showCreditsToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      }
    };
    window.addEventListener("message", eventHandler);
    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, [disabledTypes.join(","), collapseTransactions]);

  const theme = useMemo(
    () => localStorage.getItem("vite-ui-colorScheme") ?? "system",
    [],
  );

  return (
    <ControllerPresetProvider>
      <Sonner
        id={CONTROLLER_TOASTER_ID}
        position={position}
        theme={theme as SonnerToasterProps["theme"]}
        className="toaster group"
        duration={duration}
        toastOptions={{
          // Toasts render in Inter (loaded by styles.css) with a sans-serif
          // fallback.
          style: { fontFamily: "Inter, sans-serif" },
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
    </ControllerPresetProvider>
  );
}
