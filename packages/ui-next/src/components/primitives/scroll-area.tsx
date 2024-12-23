"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  // If the scrollbar is not hidden, it remains visible for 500ms before fading out
  const [opacity, setOpacity] = React.useState<number>(0);
  const [hidden, setHidden] = React.useState<boolean>(true);
  const opacityTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hiddenTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Set visible each time the scrollbar is used
  const onScrollCapture = React.useCallback(() => {
    if (opacityTimeout.current) clearTimeout(opacityTimeout.current);
    if (hiddenTimeout.current) clearTimeout(hiddenTimeout.current);
    setOpacity(100);
    setHidden(false);
    opacityTimeout.current = setTimeout(() => setOpacity(0), 500);
  }, []);

  React.useEffect(() => {
    if (opacity === 0) {
      hiddenTimeout.current = setTimeout(() => setHidden(true), 300);
    }
  }, [opacity]);

  // Cleanup the timeout if the component unmounts
  React.useEffect(() => {
    return () => {
      if (opacityTimeout.current) {
        clearTimeout(opacityTimeout.current);
      }
      if (hiddenTimeout.current) {
        clearTimeout(hiddenTimeout.current);
      }
    };
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      onScrollCapture={onScrollCapture}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar className={cn(`opacity-${opacity}`, hidden && "hidden")} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-opacity duration-300",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
