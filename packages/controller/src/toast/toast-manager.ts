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

export function showToast(config: ToastConfig): void {
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
      toastConfig = showAchievementToast(achievementConfig);
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
      toastConfig = showNetworkSwitchToast(networkConfig);
      break;
    }
    case "error":
      toastConfig = showErrorToast({
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
      toastConfig = showTransactionToast(transactionConfig);
      break;
    }
  }

  toast(toastConfig);
}
