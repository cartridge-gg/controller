import { FollowerTab, Tabs, TabsList } from "@/index";
import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

interface FollowerTabsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof followerTabsVariants> {
  followers: number;
  following: number;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const followerTabsVariants = cva(
  "grid w-full grid-cols-2 gap-x-4 p-0 h-10",
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
  onValueChange,
  variant,
  className,
  children,
}: FollowerTabsProps) => {
  return (
    <Tabs className={className} value={value} onValueChange={onValueChange}>
      <TabsList className={cn(followerTabsVariants({ variant }))}>
        <FollowerTab
          value="followers"
          label="Followers"
          counter={followers}
          active={value === "followers"}
        />
        <FollowerTab
          value="following"
          label="Following"
          counter={following}
          active={value === "following"}
        />
      </TabsList>
      {children}
    </Tabs>
  );
};

export default FollowerTabs;
