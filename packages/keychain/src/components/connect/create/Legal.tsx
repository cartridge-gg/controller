import { LockIcon } from "@cartridge/ui-next";
import { Link } from "react-router-dom";

export const Legal = () => (
  <div className="flex items-center gap-1 text-muted-foreground mb-3">
    <LockIcon />
    <div className="text-xs">
      By continuing you are agreeing to Cartridge&apos;s{" "}
      <Link
        to="https://cartridge.gg/legal/terms-of-service"
        target="_blank"
        className="underline"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        to="https://cartridge.gg/legal/privacy-policy"
        target="_blank"
        className="underline"
      >
        Privacy Policy
      </Link>
    </div>
  </div>
);
