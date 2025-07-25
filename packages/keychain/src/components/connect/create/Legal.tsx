import { Link } from "react-router-dom";

export function Legal() {
  return (
    <div className="flex items-center gap-1 text-foreground-400 px-1">
      <div className="text-xs">
        By continuing you are agreeing to Cartridge&apos;s{" "}
        <Link
          to="https://cartridge.gg/legal/terms-of-service"
          target="_blank"
          className="underline focus:text-primary focus:outline-none"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="https://cartridge.gg/legal/privacy-policy"
          target="_blank"
          className="underline focus:text-primary focus:outline-none"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
