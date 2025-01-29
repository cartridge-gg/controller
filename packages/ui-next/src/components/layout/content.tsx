import { cn, ErrorImage, Spinner } from "@cartridge/ui-next";
import { PropsWithChildren, useMemo } from "react";
import { useLayoutContext } from "./context";

export function LayoutContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  const { withBottomTabs, withFooter } = useLayoutContext();
  const mbCompensation = useMemo(() => {
    if (withBottomTabs && withFooter) {
      throw new Error("BottomTabs and Footer cannot be used at the same time");
    }

    if (withBottomTabs && !withFooter) {
      return "[@media(min-width:768px)_and_(min-height:528px)]:mb-[72px]";
    }

    if (!withBottomTabs && withFooter) {
      return "[@media(min-width:768px)_and_(min-height:400px)]:mb-[200px]";
    }
  }, [withBottomTabs, withFooter]);

  return (
    <div
      className={cn(
        "w-full px-4 flex flex-col items-stretch gap-2 overflow-y-auto",
        mbCompensation,
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
