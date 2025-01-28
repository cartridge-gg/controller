import { cn, ErrorImage, Spinner } from "@cartridge/ui-next";
import { PropsWithChildren } from "react";

export function LayoutContent({
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

export function LayoutContentLoader() {
  return (
    <LayoutContent className="h-full items-center justify-center">
      <Spinner size="lg" />
    </LayoutContent>
  );
}

export function LayoutContentError({
  children = "Oops! Something went wrong.",
}: PropsWithChildren) {
  return (
    <LayoutContent className="h-full items-center gap-8 p-8">
      <div className="text-semibold">{children}</div>
      <ErrorImage />
    </LayoutContent>
  );
}
