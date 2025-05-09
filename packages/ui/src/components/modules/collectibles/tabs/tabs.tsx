import {
  BookIcon,
  CollectibleTab,
  ListIcon,
  PulseIcon,
  Tabs,
  TabsList,
} from "@/index";
import { cn } from "@/utils";
import { HTMLAttributes, useCallback, useState } from "react";
import { cva, VariantProps } from "class-variance-authority";

interface CollectibleTabsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleTabsVariants> {
  order: ("details" | "items" | "activity")[];
  onValueChange?: (value: string) => void;
}

export const collectibleTabsVariants = cva("w-full gap-x-3 p-0 h-10", {
  variants: {
    variant: {
      darkest: "bg-transparent",
      darker: "bg-transparent",
      dark: "bg-transparent",
      default: "bg-transparent",
      light: "bg-transparent",
      lighter: "bg-transparent",
      lightest: "bg-transparent",
      ghost: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CollectibleTabs = ({
  variant,
  className,
  children,
  order,
}: CollectibleTabsProps) => {
  const [value, setValue] = useState<string>(
    order.length > 0 ? order[0] : "details",
  );

  const getIcon = useCallback(
    (value: string) => {
      switch (value) {
        case "details":
          return <BookIcon variant="solid" size="sm" />;
        case "items":
          return <ListIcon variant="solid" size="sm" />;
        case "activity":
          return <PulseIcon variant="solid" size="sm" />;
        default:
          return null;
      }
    },
    [value],
  );

  return (
    <Tabs
      className={className}
      value={value}
      onValueChange={(value) => setValue(value)}
    >
      <div className="sticky top-0 pb-4 bg-background-100 z-50">
        <TabsList className={cn(collectibleTabsVariants({ variant }))}>
          {order.map((tab) => (
            <CollectibleTab
              key={tab}
              value={tab}
              label={tab}
              active={value === tab}
              Icon={getIcon(tab)}
            />
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};

export default CollectibleTabs;
