// Test stub for @coinflowlabs/react (vitest.config.ts alias). The real CJS
// build requires the optional peer '@solana/web3.js' at load time; the app
// shims that peer via vite.config.ts, but vitest's externalized node requires
// bypass vite aliases, so we replace the whole package in tests instead.
import { forwardRef } from "react";

export const CoinflowCardForm = forwardRef(function CoinflowCardForm() {
  return null;
});

export type CardFormRef = {
  getToken: () => Promise<string>;
};

export type MerchantTheme = Record<string, unknown>;

export function MerchantStyle() {
  return null;
}
