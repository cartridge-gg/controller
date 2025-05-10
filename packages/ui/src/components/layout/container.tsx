import { isIframe, cn } from "@/utils";
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
}: PropsWithChildren & {
  className?: string;
  modal?: boolean;
  onModalClick?: () => void;
}) {
  const [withBackground, setWithBackground] = useState(false);
  const [withBottomTabs, setWithBottomTabs] = useState(false);
  const [withFooter, setWithFooter] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        withBackground,
        setWithBackground,
        withBottomTabs,
        setWithBottomTabs,
        withFooter,
        setWithFooter,
      }}
    >
      <ResponsiveWrapper>
        <div
          className={cn(
            "fixed inset-0 bg-translucent-dark-200 opacity-0 z-50",
            "transition-opacity duration-150", // This duration manage the modal fade in
            withBackground
              ? "opacity-100 visible"
              : "invisible pointer-events-none",
          )}
          onClick={() => setWithBackground(false)}
        />
        <div
          className={cn(
            "flex flex-col flex-1 min-h-0 overflow-x-hidden z-10",
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
