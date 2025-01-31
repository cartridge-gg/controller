import { ErrorImage } from "@/components/error-image";
import { Spinner } from "@/components/spinner";
import { cn } from "@/utils";
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
        withFooter &&
          "[@media(min-width:768px)_and_(min-height:400px)]:mb-[200px]",
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
