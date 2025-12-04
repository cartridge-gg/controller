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
  isDraft?: boolean;
}

// Marketplace Toast
export interface MarketplaceToastOptions extends BaseToastOptions {
  variant: "marketplace";
  itemName: string;
  itemImage: string;
  action: "purchased" | "sold";
}

// Union type for all toast variants
export type ToastOptions =
  | ErrorToastOptions
  | TransactionToastOptions
  | NetworkSwitchToastOptions
  | AchievementToastOptions
  | MarketplaceToastOptions;
