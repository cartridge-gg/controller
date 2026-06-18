import { useContext } from "react";
import { CreditPurchaseContext } from "./credit-purchase-context";

export const useCreditPurchaseContext = () => {
  const context = useContext(CreditPurchaseContext);
  if (!context) {
    throw new Error(
      "useCreditPurchaseContext must be used within CreditPurchaseProvider",
    );
  }
  return context;
};
