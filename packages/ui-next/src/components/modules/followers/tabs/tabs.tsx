import { cn, FollowerTab, Tabs, TabsList } from "@/index";
import { HTMLAttributes, useCallback, useState } from "react";
import { cva, VariantProps } from "class-variance-authority";

interface FollowerTabsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof followerTabsVariants> {
  followers: number;
  following: number;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const followerTabsVariants = cva(
  "h-10 grid w-full grid-cols-2 gap-x-4 p-0",
  {
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
  },
);

export const FollowerTabs = ({
  followers,
  following,
  value,
  variant,
  className,
  children,
  onValueChange,
}: FollowerTabsProps) => {
  const [active, setActive] = useState("followers");
  const handleChange = useCallback(
    (value: string) => {
      setActive(value);
      onValueChange?.(value);
    },
    [setActive, onValueChange],
  );

  return (
    <Tabs className={className} value={value} onValueChange={handleChange}>
      <TabsList className={cn(followerTabsVariants({ variant }), className)}>
        <FollowerTab
          value="followers"
          label="Followers"
          counter={followers}
          active={active === "followers"}
        />
        <FollowerTab
          value="following"
          label="Following"
          counter={following}
          active={active === "following"}
        />
      </TabsList>
      {children}
    </Tabs>
  );
};

export default FollowerTabs;
