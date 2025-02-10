import { VerifiedIcon } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export function SessionConsent({
  isVerified,
  variant = "default",
}: {
  isVerified: boolean;
  variant?: "default" | "slot" | "signup";
}) {
  const { origin } = useConnection();
  const hostname = useMemo(
    () => (origin ? new URL(origin).hostname : undefined),
    [origin],
  );

  switch (variant) {
    case "slot":
      return (
        <div className="text-xs text-foreground-400 font-semibold">
          Authorize Slot to manage your Cartridge infrastructure
        </div>
      );
    case "signup":
      return null;
    default:
    case "default":
      return hostname && origin ? (
        <div className="flex items-center gap-2">
          {isVerified && (
            <Link
              to="https://github.com/cartridge-gg/controller/blob/main/packages/controller/src/presets.ts"
              target="_blank"
            >
              <VerifiedIcon size="lg" className="text-foreground-200" />
            </Link>
          )}
          <div className="text-xs text-foreground-400 font-semibold">
            Authorize{" "}
            <span className="text-foreground-200 font-bold">{origin}</span> and
            allow the game to{" "}
            <span className="text-foreground-200 font-bold">
              perform actions on your behalf
            </span>
          </div>
        </div>
      ) : null;
  }
}
