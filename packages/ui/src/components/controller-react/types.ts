// Wire-protocol contract for controller toasts. This is the SINGLE source of
// truth: the exported receiver <ControllerToaster /> consumes these types
// directly, the keychain emitter imports them from the
// `@cartridge/controller-ui` root (re-exported via
// `@/components/primitives/toast`), and `@cartridge/controller/react`
// re-exports the public subset — its build inlines them into the published
// `.d.ts` (see packages/controller/vite.config.js). Keep changes
// backward-compatible.
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
  itemImages: (string | React.ReactNode)[];
  collectionName: string;
  action: "purchased" | "sold" | "sent" | "listed" | "unlisted";
}

// User Toast
export type UserToastKind = "created" | "connected" | "disconnected";

export interface UserToastOptions extends BaseToastOptions {
  variant: "user";
  username: string;
  kind?: UserToastKind;
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

// Credits Toast
export type CreditsToastKind = "deposit" | "withdraw";
export type CreditsToastStatus = "initiated" | "completed";

export interface CreditsToastOptions extends BaseToastOptions {
  variant: "credits";
  kind: CreditsToastKind;
  status: CreditsToastStatus;
  amount: number;
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
  | SettingToastOptions
  | CreditsToastOptions;

export const CONTROLLER_TOAST_MESSAGE_TYPE = "controller-toast";

export interface ControllerToastEventMessage {
  type: typeof CONTROLLER_TOAST_MESSAGE_TYPE;
  options: ToastOptions;
}
