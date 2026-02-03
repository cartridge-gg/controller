import React, { createContext, useContext, useCallback, useMemo } from "react";
import {
  AchievementToastOptions,
  MarketplaceToastOptions,
  NetworkSwitchToastOptions,
  QuestToastOptions,
  ToastOptions,
  TransactionToastOptions,
} from "@cartridge/ui";
import { isIframe } from "@cartridge/ui/utils";
import { toast as sonnerToast } from "sonner";

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    transaction: (
      message: string,
      options: Omit<TransactionToastOptions, "variant">,
    ) => void;
    networkSwitch: (
      message: string,
      options: Omit<NetworkSwitchToastOptions, "variant">,
    ) => void;
    marketplace: (
      message: string,
      options: Omit<MarketplaceToastOptions, "variant">,
    ) => void;
    achievement: (
      message: string,
      options: Omit<AchievementToastOptions, "variant">,
    ) => void;
    quest: (options: Omit<QuestToastOptions, "variant">) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  // toast injected at document level
  // from @cartridge/controller
  // const addToast = useCallback((options: ToastOptions) => {
  //   if (!toast) return;
  //   toast(options);
  // }, []);

  const emitToast = useCallback((options: ToastOptions) => {
    if (isIframe()) {
      const searchParams = new URLSearchParams(window.location.search);
      const preset = searchParams.get("preset") ?? undefined;
      window.parent.postMessage(
        {
          type: "controller-toast",
          options: {
            duration: 5000,
            ...options,
            preset,
          },
        },
        "*",
      );
    }
  }, []);

  const toast = useMemo(
    () => ({
      success: (message: string) => {
        sonnerToast.success(message);
        emitToast({
          variant: "success",
          message,
        });
      },
      error: (message: string) => {
        sonnerToast.error(message);
        emitToast({
          variant: "error",
          message,
        });
      },
      transaction: (
        message: string,
        options: Omit<TransactionToastOptions, "variant">,
      ) => {
        sonnerToast.success(message);
        emitToast({
          safeToClose: options.status === "confirmed",
          ...options,
          variant: "transaction",
        });
      },
      networkSwitch: (
        message: string,
        options: Omit<NetworkSwitchToastOptions, "variant">,
      ) => {
        sonnerToast.success(message);
        emitToast({
          ...options,
          variant: "network-switch",
        });
      },
      marketplace: (
        message: string,
        options: Omit<MarketplaceToastOptions, "variant">,
      ) => {
        sonnerToast.success(message);
        emitToast({
          duration: 10000,
          safeToClose: true,
          ...options,
          variant: "marketplace",
        });
      },
      achievement: (
        message: string,
        options: Omit<AchievementToastOptions, "variant">,
      ) => {
        sonnerToast.success(message);
        emitToast({
          ...options,
          variant: "achievement",
        });
      },
      quest: (options: Omit<QuestToastOptions, "variant">) => {
        sonnerToast.success(options.subtitle);
        emitToast({
          ...options,
          variant: "quest",
        });
      },
    }),
    [emitToast],
  );

  const value: ToastContextType = {
    toast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
