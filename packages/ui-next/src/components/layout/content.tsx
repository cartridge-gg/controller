import { cn, ErrorImage, Spinner } from "@cartridge/ui-next";
import { PropsWithChildren } from "react";
import { useLayoutContext } from "./context";

export function LayoutContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  const { withFooter } = useLayoutContext();

  return (
    <div
      className={cn(
        "w-full px-4 flex flex-col items-stretch gap-2 overflow-y-auto",
        withFooter && "[@media(max-height:600px)]:max-h-[400px]",
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
