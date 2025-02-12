import { cn, ErrorImage, Spinner } from "@cartridge/ui-next";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useLayoutContext } from "./context";

export function LayoutContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  const { withFooter } = useLayoutContext();
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

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full px-4 flex flex-col items-stretch gap-2 overflow-y-scroll",
        withFooter &&
          "[@media(min-width:768px)_and_(min-height:400px)]:mb-[200px]",
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
