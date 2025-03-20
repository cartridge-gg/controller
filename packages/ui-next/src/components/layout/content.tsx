import { cn, ErrorImage, Spinner } from "@cartridge/ui-next";
import { PropsWithChildren, useEffect, useRef, useState, useMemo } from "react";
import { useLayoutContext } from "./context";
import { isIframe } from "@cartridge/utils";

export function LayoutContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  const [scrollbarOpacity, setScrollbarOpacity] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(1000);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setTransitionDuration(150);
      setScrollbarOpacity(0.3);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setTransitionDuration(300);
        setScrollbarOpacity(0);
      }, 1000);
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const { withBottomTabs, withFooter } = useLayoutContext();
  const mbCompensation = useMemo(() => {
    if (withBottomTabs && withFooter) {
      throw new Error("BottomTabs and Footer cannot be used at the same time");
    }

    if (!isIframe()) {
      return;
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
      ref={containerRef}
      className={cn(
        "w-full p-6 flex flex-col items-stretch gap-2 overflow-y-scroll",
        mbCompensation,
        isIframe() && "flex-1",
        className,
      )}
      style={{
        scrollbarWidth: "none",
        scrollbarColor: `rgba(100, 100, 100, ${scrollbarOpacity}) transparent`,
        transition: `scrollbar-color ${transitionDuration}ms ease-in-out`,
      }}
    >
      <style>
        {`
          ::-webkit-scrollbar-thumb {
            display: none;
            background: rgba(100, 100, 100, ${scrollbarOpacity});
            transition: background ${transitionDuration}ms ease-in-out;
          }
        `}
      </style>
      {children}
    </div>
  );
}

export function LayoutContentLoader() {
  return (
    <LayoutContent className="h-full w-full items-center justify-center pb-4 select-none">
      <div className="w-full flex justify-center items-center h-full border border-dashed rounded-md border-background-400 mb-4">
        <Spinner className="text-foreground-400" size="lg" />
      </div>
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
