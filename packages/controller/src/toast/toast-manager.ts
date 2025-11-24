export type ToastConfig =
  | {
      type: "achievement";
      title: string;
      subtitle?: string;
      xpAmount?: number;
      progress?: number;
      isDraft?: boolean;
      duration?: number;
    }
  | {
      type: "networkSwitch";
      networkName: string;
      networkIcon?: any;
      duration?: number;
    }
  | {
      type: "error";
      message: string;
      duration?: number;
    }
  | {
      type: "transaction";
      label: string;
      status?: "confirming" | "confirmed";
      duration?: number;
    };

import {
  toast,
  showAchievementToast,
  showNetworkSwitchToast,
  showErrorToast,
  showTransactionToast,
} from "@cartridge/ui";

/**
 * Get the toast function from the injected CartridgeToaster if available,
 * otherwise fall back to the imported toast function.
 */
function getToastFunction(): typeof toast {
  if (
    typeof window !== "undefined" &&
    (window as any).CartridgeToaster?.toast
  ) {
    return (window as any).CartridgeToaster.toast;
  }
  return toast;
}

/**
 * Get the toast helper functions from the injected CartridgeToaster if available,
 * otherwise fall back to the imported functions.
 */
function getToastHelpers() {
  if (typeof window !== "undefined" && (window as any).CartridgeToaster) {
    const CartridgeToaster = (window as any).CartridgeToaster;
    return {
      showAchievementToast:
        CartridgeToaster.showAchievementToast || showAchievementToast,
      showNetworkSwitchToast:
        CartridgeToaster.showNetworkSwitchToast || showNetworkSwitchToast,
      showErrorToast: CartridgeToaster.showErrorToast || showErrorToast,
      showTransactionToast:
        CartridgeToaster.showTransactionToast || showTransactionToast,
    };
  }
  return {
    showAchievementToast,
    showNetworkSwitchToast,
    showErrorToast,
    showTransactionToast,
  };
}

export function showToast(config: ToastConfig): void {
  const toastFn = getToastFunction();
  const helpers = getToastHelpers();
  let toastConfig: any;

  switch (config.type) {
    case "achievement": {
      const achievementConfig: any = {
        title: config.title,
        xpAmount: config.xpAmount ?? 0,
        isDraft: config.isDraft ?? false,
      };
      if (config.subtitle !== undefined)
        achievementConfig.subtitle = config.subtitle;
      if (config.progress !== undefined)
        achievementConfig.progress = config.progress;
      if (config.duration !== undefined)
        achievementConfig.duration = config.duration;
      toastConfig = helpers.showAchievementToast(achievementConfig);
      break;
    }
    case "networkSwitch": {
      const networkConfig: any = {
        networkName: config.networkName,
      };
      if (config.networkIcon !== undefined)
        networkConfig.networkIcon = config.networkIcon;
      if (config.duration !== undefined)
        networkConfig.duration = config.duration;
      toastConfig = helpers.showNetworkSwitchToast(networkConfig);
      break;
    }
    case "error":
      toastConfig = helpers.showErrorToast({
        message: config.message,
        duration: config.duration,
      });
      break;
    case "transaction": {
      const transactionConfig: any = {
        label: config.label,
      };
      if (config.status !== undefined) transactionConfig.status = config.status;
      if (config.duration !== undefined)
        transactionConfig.duration = config.duration;
      toastConfig = helpers.showTransactionToast(transactionConfig);
      break;
    }
  }

  toastFn(toastConfig);
}
