export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

// Base toast options shared by all variants
export interface BaseToastOptions {
  duration?: number; // in milliseconds, 0 means persistent
  position?: ToastPosition;
  preset?: string;
  safeToClose?: boolean;
  onClick?: () => void; // Optional click handler for the entire toast
}

// Error Toast
export interface ErrorToastOptions extends BaseToastOptions {
  variant: "error";
  message: string;
}

// Transaction Toast
export interface TransactionToastOptions extends BaseToastOptions {
  variant: "transaction";
  status: "confirming" | "confirmed";
  isExpanded?: boolean;
  label?: string;
}

// Network Switch Toast
export interface NetworkSwitchToastOptions extends BaseToastOptions {
  variant: "network-switch";
  networkName: string;
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
  itemImages: string[];
  collectionName: string;
  action: "purchased" | "sold" | "sent" | "listed" | "unlisted";
}

// Union type for all toast variants
export type ToastOptions =
  | ErrorToastOptions
  | TransactionToastOptions
  | NetworkSwitchToastOptions
  | AchievementToastOptions
  | QuestToastOptions
  | MarketplaceToastOptions;
