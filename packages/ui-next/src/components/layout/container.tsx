import { cn } from "@/utils";
import { isIframe } from "@cartridge/utils";
import { type PropsWithChildren, useEffect, useState } from "react";
import { LayoutContext } from "./context";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

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
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>
      </ResponsiveWrapper>
    </LayoutContext.Provider>
  );
}

function ResponsiveWrapper({ children }: PropsWithChildren) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isStorybook = typeof window !== 'undefined' && window.location.href.includes('iframe.html');

  if (isDesktop) {
    return (
      <div className={cn(
        "flex items-center justify-center",
        isStorybook ? "w-full h-full" : "w-screen h-dvh"
      )}>
        <div
          className={cn(
            "w-desktop border border-background-200 rounded-xl flex flex-col relative overflow-hidden align-middle",
            !isIframe() && "w-[432px] max-h-[600px]",
            isStorybook && "!w-full !h-full"
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
