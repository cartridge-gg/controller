"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const [hidden, setHidden] = React.useState<boolean>(true);
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      onScrollCapture={() => setHidden((previous) => !previous)}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar hidden={hidden} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ hidden, className, orientation = "vertical", ...props }, ref) => {
  // If the scrollbar is not hidden, it remains visible for 500ms before fading out
  // `hidden` is a prop which trigger the useEffect each time the scrollbar is used
  const [visible, setVisible] = React.useState<boolean>(false);
  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  // Set visible each time the scrollbar is used
  React.useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setVisible(true);
    timeout.current = setTimeout(() => {
      setVisible(false);
    }, 500);
  }, [hidden]);

  // Cleanup the timeout if the component unmounts
  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "touch-none select-none transition-opacity duration-300",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
