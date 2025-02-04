import { PropsWithChildren, useEffect } from "react";
import { useLayoutContext } from "./context";

export function LayoutBottomTabs(
  props: PropsWithChildren & { className?: string },
) {
  const { setWithBottomTabs } = useLayoutContext();

  useEffect(() => {
    setWithBottomTabs(true);
  }, [setWithBottomTabs]);

  return (
    <div
      className="h-[72px] w-full bg-background flex items-stretch px-4 pb-2 shrink-0"
      {...props}
    />
  );
}
