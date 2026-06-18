import { useContext } from "react";
import { WalletsContext, WalletsContextValue } from "./wallets-context";

export const useWallets = (): WalletsContextValue => {
  const context = useContext(WalletsContext);
  if (context === undefined) {
    throw new Error("useWallets must be used within a WalletsProvider");
  }
  return context;
};
