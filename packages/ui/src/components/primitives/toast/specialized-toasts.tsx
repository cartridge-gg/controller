"use client";

import React, { memo, useState, useEffect } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils";
import {
  CheckIcon,
  SpinnerIcon,
  AlertIcon,
  AwardIcon,
  SparklesIcon,
  SparklesDraftIcon,
  TransactionIcon,
} from "@/components/icons";
import { StarknetColorIcon } from "@/components/icons/brand-color";
import { CollectibleImage } from "@/components/modules/collectibles";
import { ToasterToast } from "./use-toast";
import { Toast } from "./toast";
import { usePresetColor } from "@/utils/context/presets";

// Base toast container for specialized toasts
const specializedToastVariants = cva(
  "flex flex-col items-start p-0 bg-background shadow-lg rounded-lg border-0 overflow-hidden relative",
  {
    variants: {
      variant: {
        achievement: "w-[360px] h-[68px]",
        network: "w-[360px] h-[52px]",
        error: "w-[360px] h-[52px] bg-destructive",
        transaction: "w-[360px] h-[52px]",
      },
    },
    defaultVariants: {
      variant: "achievement",
    },
  },
);

// XP Tag Component
interface XPTagProps {
  amount: number;
  isMainnet?: boolean;
}

const XPTag = memo<XPTagProps>(({ amount, isMainnet = true }) => (
  <div className="flex items-center gap-[2px]">
    <div className="w-5 h-5 flex items-center justify-center">
      {isMainnet ? (
        <SparklesIcon variant="solid" size="sm" className="text-foreground" />
      ) : (
        <SparklesDraftIcon size="sm" className="text-foreground" />
      )}
    </div>
    <span className="text-foreground text-sm font-normal leading-5">
      {amount}
    </span>
  </div>
));

XPTag.displayName = "XPTag";

// Toast Progress Bar Component
interface ToastProgressBarProps {
  progress: number; // 0-100
  variant?: "achievement" | "error";
  className?: string;
  preset?: string | null;
  color?: string;
}

const ToastProgressBar = memo<ToastProgressBarProps>(
  ({ progress, variant = "achievement", className, preset, color }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const presetColor = usePresetColor(preset);
    const barColor = color || presetColor;

    useEffect(() => {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    }, [progress]);

    const getColors = () => {
      if (variant === "error") {
        return {
          bg: "bg-translucent-dark-100",
          fill: "bg-translucent-dark-200",
        };
      }
      return {
        bg: "bg-background-200",
        fill: barColor ? undefined : "bg-achievement",
      };
    };

    const colors = getColors();

    return (
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 w-full h-1",
          colors.bg,
          className,
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-out",
            colors.fill,
          )}
          style={{
            width: `${animatedProgress}%`,
            backgroundColor: barColor ?? undefined,
          }}
        />
      </div>
    );
  },
);

ToastProgressBar.displayName = "ToastProgressBar";

// Achievement Toast Component
interface AchievementToastProps extends Omit<ToasterToast, "children"> {
  title: string;
  subtitle?: string;
  xpAmount: number;
  progress: number;
  isDraft?: boolean;
  duration?: number;
  preset?: string;
}

const AchievementToast = memo<AchievementToastProps>(
  ({
    title,
    subtitle = "Earned!",
    xpAmount,
    progress = 100,
    isDraft = false,
    preset,
    duration,
    showClose,
    toastId,
    className,
    ...props
  }) => {
    const IconComponent = AwardIcon;
    const iconColor = isDraft
      ? "var(--achievement-200)"
      : "var(--achievement-100)";

    return (
      <Toast
        className={cn(
          specializedToastVariants({ variant: "achievement" }),
          className,
        )}
        showClose={showClose}
        toastId={toastId}
        {...props}
      >
        <div className="flex items-center justify-between px-3 py-3 w-full flex-1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-background rounded p-[5px] flex-shrink-0">
              <IconComponent
                size="lg"
                className="min-w-6"
                style={{ color: iconColor }}
              />
            </div>
            <div className="flex flex-col justify-center gap-[2px] flex-1 min-w-0">
              <span className="text-foreground text-sm font-medium leading-5 tracking-[0.01em] truncate">
                {title}
              </span>
              <span className="text-foreground-300 text-xs font-normal leading-4 truncate">
                {subtitle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <XPTag amount={xpAmount} isMainnet={!isDraft} />
          </div>
        </div>
        <ToastProgressBar
          progress={progress}
          variant="achievement"
          preset={isDraft ? null : preset}
          color={isDraft ? "var(--achievement-200)" : undefined}
        />
      </Toast>
    );
  },
);

AchievementToast.displayName = "AchievementToast";

// Marketplace Toast Component
interface MarketplaceToastProps extends Omit<ToasterToast, "children"> {
  title: string;
  collectionName: string;
  itemNames: string[];
  itemImages: string[];
  progress?: number;
  preset?: string;
}

const MarketplaceToast = memo<MarketplaceToastProps>(
  ({
    title,
    collectionName,
    itemNames,
    itemImages,
    progress = 100,
    preset,
    showClose,
    toastId,
    className,
    ...props
  }) => {
    return (
      <Toast
        className={cn(
          specializedToastVariants({ variant: "achievement" }),
          className,
        )}
        showClose={showClose}
        toastId={toastId}
        {...props}
      >
        <div className="flex items-center justify-between px-3 py-3 w-full flex-1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-background rounded p-[5px] flex-shrink-0">
              <CollectibleImage images={itemImages} />
            </div>
            <div className="flex flex-col justify-center gap-[2px] flex-1 min-w-0">
              <span className="text-foreground text-sm font-medium leading-5 tracking-[0.01em] truncate">
                {title}
              </span>
              <span className="text-foreground-300 text-xs font-normal leading-4 truncate">
                {itemNames.length > 1
                  ? `${itemNames.length} ${collectionName}`
                  : (itemNames[0] ?? "1 Item")}
              </span>
            </div>
          </div>
        </div>
        <ToastProgressBar
          progress={progress}
          variant="achievement"
          preset={preset}
        />
      </Toast>
    );
  },
);

MarketplaceToast.displayName = "MarketplaceToast";

// Network Switch Toast Component
interface NetworkSwitchToastProps extends Omit<ToasterToast, "children"> {
  networkName: string;
  networkIcon?: React.ReactNode;
}

const NetworkSwitchToast = memo<NetworkSwitchToastProps>(
  ({ networkName, networkIcon, showClose, toastId, className, ...props }) => (
    <Toast
      className={cn(
        specializedToastVariants({ variant: "network" }),
        className,
      )}
      showClose={showClose}
      toastId={toastId}
      {...props}
    >
      <div className="flex items-center justify-between px-3 py-3 w-full h-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
            {!networkIcon ? (
              <StarknetColorIcon size="default" className="min-w-6 scale-125" />
            ) : typeof networkIcon === "string" &&
              networkIcon.startsWith("http") ? (
              <img src={networkIcon} alt="" />
            ) : (
              networkIcon
            )}
          </div>
          <span className="text-foreground text-sm font-medium leading-5 tracking-[0.01em] truncate">
            Switched to {networkName}
          </span>
        </div>
      </div>
    </Toast>
  ),
);

NetworkSwitchToast.displayName = "NetworkSwitchToast";

// Error Toast Component
interface ErrorToastProps extends Omit<ToasterToast, "children"> {
  message: string;
  progress?: number;
  preset?: string;
}

const ErrorToast = memo<ErrorToastProps>(
  ({
    message,
    progress = 100,
    preset,
    showClose,
    toastId,
    className,
    ...props
  }) => (
    <Toast
      className={cn(specializedToastVariants({ variant: "error" }), className)}
      showClose={showClose}
      toastId={toastId}
      {...props}
      variant="destructive"
    >
      <div className="flex items-center justify-between px-3 py-3 w-full flex-1">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertIcon
            size="default"
            className="text-destructive-foreground min-w-6"
          />
          <span className="text-destructive-foreground text-sm font-medium leading-5 tracking-[0.01em] truncate">
            {message}
          </span>
        </div>
      </div>
      <ToastProgressBar progress={progress} variant="error" preset={preset} />
    </Toast>
  ),
);

ErrorToast.displayName = "ErrorToast";

// Success Toast Component
interface SuccessToastProps extends Omit<ToasterToast, "children"> {
  message: string;
  progress?: number;
  preset?: string;
}

const SuccessToast = memo<SuccessToastProps>(
  ({
    message,
    progress = 100,
    preset,
    showClose,
    toastId,
    className,
    ...props
  }) => (
    <Toast
      className={cn(
        specializedToastVariants({ variant: "transaction" }),
        className,
      )}
      showClose={showClose}
      toastId={toastId}
      {...props}
    >
      <div className="flex items-center justify-between px-3 py-3 w-full flex-1">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CheckIcon size="default" className="text-foreground min-w-6" />
          <span className="text-foreground text-sm font-normal leading-5 tracking-[0.01em] truncate">
            {message}
          </span>
        </div>
      </div>
      <ToastProgressBar
        progress={progress}
        variant="achievement"
        preset={preset}
      />
    </Toast>
  ),
);

SuccessToast.displayName = "SuccessToast";

// Transaction Notification Component
interface TransactionToastProps extends Omit<ToasterToast, "children"> {
  status: "confirming" | "confirmed";
  isExpanded?: boolean;
  label?: string;
  progress?: number;
  preset?: string;
}

const TransactionToast = memo<TransactionToastProps>(
  ({
    status,
    isExpanded = true,
    label,
    progress = 100,
    preset,
    showClose,
    toastId,
    className,
    ...props
  }) => {
    if (!isExpanded) {
      return (
        <Toast
          className="flex items-center justify-center p-[10px] w-12 h-12 bg-background shadow-lg rounded-lg border-0 overflow-hidden"
          showClose={!isExpanded ? false : showClose}
          toastId={toastId}
          {...props}
        >
          <div className="w-7 h-7 flex items-center justify-center">
            {status === "confirming" ? (
              <SpinnerIcon
                size="default"
                className="text-achievement animate-spin min-w-6"
              />
            ) : (
              <CheckIcon size="default" className="text-achievement min-w-6" />
            )}
          </div>
        </Toast>
      );
    }

    return (
      <Toast
        className={cn(
          specializedToastVariants({ variant: "transaction" }),
          className,
        )}
        showClose={showClose}
        toastId={toastId}
        {...props}
      >
        <div className="flex items-center justify-between px-3 py-3 w-full flex-1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-6 h-6 flex items-center justify-center">
              {status === "confirming" ? (
                <SpinnerIcon
                  size="default"
                  className="text-foreground animate-spin min-w-6"
                />
              ) : (
                <CheckIcon size="default" className="text-foreground min-w-6" />
              )}
            </div>
            <span className="text-foreground text-sm font-normal leading-5 tracking-[0.01em] truncate">
              {status === "confirming" ? "Confirming" : "Confirmed"}
            </span>
            {status === "confirming" && (
              <div className="flex items-center py-1 bg-translucent-dark-100 rounded-[2px] flex-shrink-0">
                <div className="w-4 h-4 mr-1 flex items-center justify-center">
                  <TransactionIcon className="w-[11px] h-[9px] text-achievement" />
                </div>
                <span className="text-achievement text-xs font-normal leading-4 whitespace-nowrap">
                  {label}
                </span>
              </div>
            )}
          </div>
        </div>
        <ToastProgressBar
          progress={status === "confirmed" ? 100 : progress}
          variant="achievement"
          preset={preset}
        />
      </Toast>
    );
  },
);

TransactionToast.displayName = "TransactionToast";

// Convenience functions for using with the existing toast system
type ToastPropsToOmit = "safeToClose" | "variant" | "children";

export const showAchievementToast = (
  props: Omit<AchievementToastProps, ToastPropsToOmit>,
) => {
  const toastId = props.toastId || `achievement-${Date.now()}`;
  return {
    duration: props.duration,
    toasterId: props.toasterId,
    toastId,
    element: <AchievementToast {...props} showClose={true} toastId={toastId} />,
  };
};

export const showMarketplaceToast = (
  props: Omit<MarketplaceToastProps, ToastPropsToOmit>,
) => {
  const toastId = props.toastId || `marketplace-${Date.now()}`;
  return {
    duration: props.duration,
    toasterId: props.toasterId,
    toastId,
    element: <MarketplaceToast {...props} showClose={true} toastId={toastId} />,
  };
};

export const showNetworkSwitchToast = (
  props: Omit<NetworkSwitchToastProps, ToastPropsToOmit>,
) => {
  const toastId = props.toastId || `network-${Date.now()}`;
  return {
    duration: props.duration,
    toasterId: props.toasterId,
    toastId,
    element: (
      <NetworkSwitchToast {...props} showClose={true} toastId={toastId} />
    ),
  };
};

export const showErrorToast = (
  props: Omit<ErrorToastProps, ToastPropsToOmit>,
) => {
  const toastId = props.toastId || `error-${Date.now()}`;
  return {
    variant: "destructive" as const,
    duration: props.duration,
    toasterId: props.toasterId,
    toastId,
    element: <ErrorToast {...props} showClose={true} toastId={toastId} />,
  };
};

export const showSuccessToast = (
  props: Omit<SuccessToastProps, ToastPropsToOmit>,
) => {
  const toastId = props.toastId || `success-${Date.now()}`;
  return {
    variant: "default" as const,
    duration: props.duration,
    toasterId: props.toasterId,
    toastId,
    element: <SuccessToast {...props} showClose={true} toastId={toastId} />,
  };
};

export const showTransactionToast = (
  props: Omit<TransactionToastProps, ToastPropsToOmit>,
) => {
  const toastId = props.toastId || `transaction-${Date.now()}`;
  return {
    duration: props.duration,
    toasterId: props.toasterId,
    toastId,
    element: <TransactionToast {...props} showClose={true} toastId={toastId} />,
  };
};

export {
  AchievementToast,
  MarketplaceToast,
  NetworkSwitchToast,
  ErrorToast,
  SuccessToast,
  TransactionToast,
  XPTag,
  ToastProgressBar,
  type AchievementToastProps,
  type MarketplaceToastProps,
  type NetworkSwitchToastProps,
  type ErrorToastProps,
  type SuccessToastProps,
  type TransactionToastProps,
};
