// Wire-protocol contract for controller toasts. This is the single source of
// truth shared by BOTH the keychain emitter (postMessage) and the exported
// receiver <ControllerToaster /> (which re-exports this file from
// `@/components/controller-react/types`). Keep changes backward-compatible.
export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

// Base toast options shared by all variants
export interface BaseToastOptions {
  toastId?: string; // for updating pushed toasts
  duration?: number; // in milliseconds, 0 means persistent
  position?: ToastPosition;
  progress?: number;
  preset?: string;
  safeToClose?: boolean;
  onClick?: () => void; // Optional click handler for the entire toast
}

// Error Toast
export interface ErrorToastOptions extends BaseToastOptions {
  variant: "error";
  message: string;
}

// Success Toast
export interface SuccessToastOptions extends BaseToastOptions {
  variant: "success";
  message: string;
}

// Transaction Toast
export interface TransactionToastOptions extends BaseToastOptions {
  variant: "transaction";
  status: "confirming" | "confirmed";
  isExpanded?: boolean;
  label?: string;
}

// Network Toast
export type NetworkToastKind = "connect" | "switch-chain";

export interface NetworkToastOptions extends BaseToastOptions {
  variant: "network";
  kind: NetworkToastKind;
  chainId: string;
  networkName?: string;
  networkIcon?: string;
}

// Achievement Toast
export interface AchievementToastOptions extends BaseToastOptions {
  variant: "achievement";
  title: string;
  subtitle?: string;
  iconUrl?: string;
  xpAmount: number;
  progress: number;
  isDraft?: boolean;
}

// Quest Toast
export interface QuestToastOptions extends BaseToastOptions {
  variant: "quest";
  title: string;
  subtitle: string;
}

// Marketplace Toast
export interface MarketplaceToastOptions extends BaseToastOptions {
  variant: "marketplace";
  itemNames: string[];
  itemImages: string[];
  collectionName: string;
  action: "purchased" | "sold" | "sent" | "listed" | "unlisted";
}

// User Toast
export interface UserToastOptions extends BaseToastOptions {
  variant: "user";
  username: string;
  kind?: "created" | "connected" | "disconnected";
  message?: string;
}

// Setting Toast
export type SettingToastKind = "signer";
export type SettingToastAction = "created" | "deleted";

export interface SettingToastOptions extends BaseToastOptions {
  variant: "setting";
  kind: SettingToastKind;
  action: SettingToastAction;
}

// Union type for all toast variants
export type ToastOptions =
  | ErrorToastOptions
  | SuccessToastOptions
  | TransactionToastOptions
  | NetworkToastOptions
  | AchievementToastOptions
  | QuestToastOptions
  | MarketplaceToastOptions
  | UserToastOptions
  | SettingToastOptions;

export const CONTROLLER_TOAST_MESSAGE_TYPE = "controller-toast";

export interface ControllerToastEventMessage {
  type: typeof CONTROLLER_TOAST_MESSAGE_TYPE;
  options: ToastOptions;
}
