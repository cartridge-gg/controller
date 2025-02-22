import { useEffect } from "react";
import { useLayoutContext } from "./context";
import { cva, VariantProps } from "class-variance-authority";

export const layoutBottomTabsVariants = cva(
  "w-full flex justify-around items-stretch shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-background-200 border-t border-spacer-100 shadow-[0px_-4px_8px_0px_rgba(0,_0,_0,_0.32)]",
      },
      size: {
        default: "h-[72px] gap-x-2 px-4 pb-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface LayoutBottomTabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutBottomTabsVariants> {}

export function LayoutBottomTabs({
  className,
  variant,
  size,
  ...props
}: LayoutBottomTabsProps) {
  const { setWithBottomTabs } = useLayoutContext();

  useEffect(() => {
    setWithBottomTabs(true);
  }, [setWithBottomTabs]);

  return (
    <div
      className={layoutBottomTabsVariants({ variant, size, className })}
      {...props}
    />
  );
}
