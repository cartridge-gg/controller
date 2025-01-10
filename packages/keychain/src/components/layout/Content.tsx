import { cn } from "@cartridge/ui-next";
import { PropsWithChildren } from "react";
export function Content({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        "w-full px-4 pb-[var(--footer-height)] flex flex-col items-stretch gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
