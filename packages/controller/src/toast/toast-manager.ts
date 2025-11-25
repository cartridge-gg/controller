import { injectToaster } from "./toast-injector";

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
      progress?: number;
      duration?: number;
    }
  | {
      type: "transaction";
      status?: "confirming" | "confirmed";
      isExpanded?: boolean;
      label?: string;
      progress?: number;
      duration?: number;
    };

interface CartridgeToasterGlobal {
  toast?: (config: any) => void;
  showAchievementToast?: (props: any) => any;
  showNetworkSwitchToast?: (props: any) => any;
  showErrorToast?: (props: any) => any;
  showTransactionToast?: (props: any) => any;
}

declare global {
  interface Window {
    CartridgeToaster?: CartridgeToasterGlobal;
  }
}

async function ensureToasterLoaded(): Promise<CartridgeToasterGlobal> {
  if (window.CartridgeToaster?.toast) return window.CartridgeToaster;

  await injectToaster();

  for (let i = 0; i < 20; i++) {
    if (window.CartridgeToaster?.toast) return window.CartridgeToaster;
    await new Promise((r) => setTimeout(r, 50));
  }

  throw new Error("CartridgeToaster failed to load");
}

export async function showToast(config: ToastConfig): Promise<void> {
  const api = await ensureToasterLoaded();

  const {
    toast,
    showAchievementToast,
    showNetworkSwitchToast,
    showErrorToast,
    showTransactionToast,
  } = api;

  if (!toast) throw new Error("CartridgeToaster.toast() not found");

  let toastConfig: any;

  switch (config.type) {
    case "achievement":
      if (!showAchievementToast)
        throw new Error("showAchievementToast missing from CartridgeToaster");
      toastConfig = showAchievementToast({
        title: config.title,
        subtitle: config.subtitle,
        xpAmount: config.xpAmount ?? 0,
        progress: config.progress ?? 100,
        isDraft: config.isDraft ?? false,
        duration: config.duration ?? 4000,
      });
      break;

    case "networkSwitch":
      if (!showNetworkSwitchToast)
        throw new Error("showNetworkSwitchToast missing from CartridgeToaster");
      toastConfig = showNetworkSwitchToast({
        networkName: config.networkName,
        networkIcon: config.networkIcon,
        duration: config.duration ?? 5000,
      });
      break;

    case "error":
      if (!showErrorToast)
        throw new Error("showErrorToast missing from CartridgeToaster");
      toastConfig = showErrorToast({
        message: config.message,
        progress: config.progress ?? 25,
        duration: config.duration ?? 8000,
      });
      break;

    case "transaction":
      if (!showTransactionToast)
        throw new Error("showTransactionToast missing from CartridgeToaster");
      toastConfig = showTransactionToast({
        status: config.status ?? "confirming",
        isExpanded: config.isExpanded ?? true,
        label: config.label ?? "Transaction",
        progress: config.progress ?? 50,
        duration: config.duration ?? 6000,
      });
      break;
  }

  toast(toastConfig);
}
