import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";
import {
  ToastOptions,
  ErrorToastOptions,
  SuccessToastOptions,
  TransactionToastOptions,
  NetworkSwitchToastOptions,
  AchievementToastOptions,
  QuestToastOptions,
  MarketplaceToastOptions,
  UserToastOptions,
  CONTROLLER_TOAST_MESSAGE_TYPE,
} from "@cartridge/controller-ui";
import { isIframe } from "@cartridge/controller-ui/utils";
import { toast as sonnerToast } from "sonner";
import { useConnection } from "@/hooks/connection";
import type { Chain } from "@cartridge/controller";

interface ToastContextType {
  toast: {
    error: (
      message: string,
      options?: Omit<ErrorToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    success: (
      message: string,
      options?: Omit<SuccessToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    transaction: (
      message: string,
      options: Omit<TransactionToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    networkSwitch: (
      message: string,
      options: Omit<NetworkSwitchToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    marketplace: (
      message: string,
      options: Omit<MarketplaceToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    achievement: (
      message: string,
      options: Omit<AchievementToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    quest: (
      options: Omit<QuestToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
    user: (
      options: Omit<UserToastOptions, "variant">,
      disabled?: boolean,
    ) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { preset } = useConnection();

  const emitToast = useCallback(
    (options: ToastOptions) => {
      if (isIframe()) {
        window.parent.postMessage(
          {
            type: CONTROLLER_TOAST_MESSAGE_TYPE,
            options: {
              ...options,
              preset,
            },
          },
          "*",
        );
      }
    },
    [preset],
  );

  const toast = useMemo(
    () => ({
      error: (
        message: string,
        options?: Omit<ErrorToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (message) sonnerToast.error(message);
        emitToast({
          variant: "error",
          message,
          ...(options ?? {}),
        });
      },
      success: (
        message: string,
        options?: Omit<SuccessToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (message) sonnerToast.success(message);
        emitToast({
          variant: "success",
          message,
          ...(options ?? {}),
        });
      },
      transaction: (
        message: string,
        options: Omit<TransactionToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (message) sonnerToast.success(message);
        emitToast({
          safeToClose: options.status === "confirmed",
          ...options,
          variant: "transaction",
        });
      },
      networkSwitch: (
        message: string,
        options: Omit<NetworkSwitchToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (message) sonnerToast.success(message);
        emitToast({
          ...options,
          variant: "network-switch",
        });
      },
      marketplace: (
        message: string,
        options: Omit<MarketplaceToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (message) sonnerToast.success(message);
        emitToast({
          safeToClose: true,
          ...options,
          variant: "marketplace",
        });
      },
      achievement: (
        message: string,
        options: Omit<AchievementToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (message) sonnerToast.success(message);
        emitToast({
          ...options,
          variant: "achievement",
        });
      },
      quest: (
        options: Omit<QuestToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        if (options.subtitle) sonnerToast.success(options.subtitle);
        emitToast({
          ...options,
          variant: "quest",
        });
      },
      user: (
        options: Omit<UserToastOptions, "variant">,
        disabled?: boolean,
      ) => {
        if (disabled) return;
        emitToast({
          ...options,
          variant: "user",
        });
      },
    }),
    [emitToast],
  );

  const value: ToastContextType = {
    toast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ChainSwitchDetector />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ChainSwitchDetector() {
  const { chainId, configuredChains } = useConnection();
  const [currentChainId, setCurrentChainId] = useState<string | undefined>();
  const { toast } = useToast();
  useEffect(() => {
    if (currentChainId && chainId && currentChainId !== chainId) {
      const chain: Chain | undefined = configuredChains.find(
        (chain) => BigInt(chain?.chainId ?? 0) === BigInt(chainId),
      ) as Chain;
      toast.networkSwitch("", {
        chainId,
        networkName: chain?.name,
        networkIcon: chain?.icon,
      });
    }
    setCurrentChainId(chainId);
  }, [toast, chainId, currentChainId, configuredChains]);

  return <></>;
}
