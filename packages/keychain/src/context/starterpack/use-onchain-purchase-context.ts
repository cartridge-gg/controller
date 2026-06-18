import { useContext } from "react";
import { OnchainPurchaseContext } from "./onchain-purchase-context";

export const useOnchainPurchaseContext = () => {
  const context = useContext(OnchainPurchaseContext);
  if (!context) {
    throw new Error(
      "useOnchainPurchaseContext must be used within OnchainPurchaseProvider",
    );
  }
  return context;
};
