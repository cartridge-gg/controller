"use client";

import { useEffect, useState } from "react";
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
import { ToastPosition } from "../types";
import { isTrustedOrigin, parseToastEvent } from "./validation";

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
      const options = parseToastEvent(event.data);
      if (!options) {
        return;
      }

      if (options.variant == "error" && !disabledTypes.includes("error")) {
        toast(
          showErrorToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        options.variant == "success" &&
        !disabledTypes.includes("success")
      ) {
        toast(
          showSuccessToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        options.variant == "network" &&
        !disabledTypes.includes("network")
      ) {
        toast(
          showNetworkToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        options.variant == "transaction" &&
        !disabledTypes.includes("transaction")
      ) {
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
        options.variant == "marketplace" &&
        !disabledTypes.includes("marketplace")
      ) {
        toast(
          showMarketplaceToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        options.variant == "achievement" &&
        !disabledTypes.includes("achievement")
      ) {
        toast(
          showAchievementToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (options.variant == "user" && !disabledTypes.includes("user")) {
        toast(
          showUserToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        options.variant == "setting" &&
        !disabledTypes.includes("setting")
      ) {
        toast(
          showSettingToast({
            ...options,
            toasterId: CONTROLLER_TOASTER_ID,
          }) as ToasterToast,
        );
      } else if (
        options.variant == "credits" &&
        !disabledTypes.includes("credits")
      ) {
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

  // localStorage only exists in the browser and Next.js App Router
  // server-renders "use client" components, so read it after mount.
  const [theme, setTheme] = useState<SonnerToasterProps["theme"]>("system");
  useEffect(() => {
    const readTheme = () =>
      setTheme(
        (localStorage.getItem("vite-ui-colorScheme") ??
          "system") as SonnerToasterProps["theme"],
      );
    readTheme();
    window.addEventListener("storage", readTheme);
    return () => window.removeEventListener("storage", readTheme);
  }, []);

  return (
    <ControllerPresetProvider>
      <Sonner
        id={CONTROLLER_TOASTER_ID}
        position={position}
        theme={theme}
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
