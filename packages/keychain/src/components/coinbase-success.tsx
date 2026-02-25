import { useEffect } from "react";
import { CheckIcon } from "@cartridge/ui";

/**
 * Success page at /coinbase/success.
 * Coinbase redirects here after a successful Apple Pay payment.
 * Auto-closes the popup after a brief delay so the user sees the confirmation.
 */
export function CoinbaseSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0F1410] gap-4">
      <div className="w-12 h-12 rounded-full bg-[#1a2e1a] flex items-center justify-center">
        <CheckIcon size="lg" className="text-[#4ade80]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[#4ade80]">
          Payment Successful
        </p>
        <p className="text-xs text-foreground-300 mt-1">
          This window will close shortly.
        </p>
      </div>
    </div>
  );
}
