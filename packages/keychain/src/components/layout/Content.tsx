import { cn } from "@cartridge/ui";
import { PropsWithChildren } from "react";

export function Content({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        "w-full px-4 flex flex-col items-stretch gap-2 max-h-[400px] overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
