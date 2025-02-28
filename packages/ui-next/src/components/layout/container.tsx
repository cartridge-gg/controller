import { useMediaQuery } from "#hooks/ui";
import { cn } from "#utils";
import { isIframe } from "@cartridge/utils";
import { type PropsWithChildren, useState } from "react";
import { LayoutContext } from "./context";

export function LayoutContainer({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  const [withBottomTabs, setWithBottomTabs] = useState(false);
  const [withFooter, setWithFooter] = useState(false);

  return (
    <LayoutContext.Provider
      value={{ withBottomTabs, setWithBottomTabs, withFooter, setWithFooter }}
    >
      <ResponsiveWrapper>
        <div
          className={cn(
            "flex flex-col flex-1 min-h-0 overflow-x-hidden",
            className,
          )}
        >
          {children}
        </div>
      </ResponsiveWrapper>
    </LayoutContext.Provider>
  );
}

function ResponsiveWrapper({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <div className="flex w-screen h-dvh items-center justify-center">
        <div
          className={cn(
            "w-desktop border border-background-200 rounded-xl flex flex-col relative overflow-hidden align-middle",
            !isIframe() && "w-[432px] max-h-[600px]",
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-dvh max-w-desktop relative flex flex-col bg-background">
      {children}
    </div>
  );
}
