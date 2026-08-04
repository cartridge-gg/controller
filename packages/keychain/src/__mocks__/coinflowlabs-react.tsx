// Test stub for @coinflowlabs/react (vitest.config.ts alias). The real CJS
// build requires the optional peer '@solana/web3.js' at load time; the app
// shims that peer via vite.config.ts, but vitest's externalized node requires
// bypass vite aliases, so we replace the whole package in tests instead.
import { forwardRef } from "react";

export const CoinflowCardForm = forwardRef(function CoinflowCardForm() {
  return null;
});

// Hosted Bank Authentication UI iframe (withdraw/BankAuthDrawer). A no-op in
// tests — the iframe + postMessage bridge live inside the real SDK.
export function CoinflowWithdraw() {
  return null;
}

export type CardFormRef = {
  getToken: () => Promise<string>;
};

export type MerchantTheme = Record<string, unknown>;

export type CoinflowWithdrawProps = Record<string, unknown>;

// Mirror the real enum shapes so module-load references (e.g.
// `MerchantStyle.Sharp`, `WithdrawSpeed.STANDARD`) resolve at test runtime.
export const MerchantStyle = {
  Rounded: "rounded",
  Sharp: "sharp",
  Pill: "pill",
} as const;

export const WithdrawSpeed = {
  ASAP: "asap",
  SAME_DAY: "same_day",
  STANDARD: "standard",
  CARD: "card",
  IBAN: "iban",
  PIX: "pix",
  EFT: "eft",
  VENMO: "venmo",
  PAYPAL: "paypal",
  WIRE: "wire",
  INTERAC: "interac",
} as const;
