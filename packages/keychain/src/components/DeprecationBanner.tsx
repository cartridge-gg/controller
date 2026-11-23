import { AlertIcon } from "@cartridge/controller-ui";

export function DeprecationBanner() {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 text-xs text-destructive-100 px-4 py-3 bg-background-100 border-b border-destructive-100"
    >
      <AlertIcon size="xs" className="flex-shrink-0" />
      <p>
        Cartridge Controller is being deprecated. Please withdraw all funds by
        January 31, 2027.
      </p>
    </div>
  );
}
