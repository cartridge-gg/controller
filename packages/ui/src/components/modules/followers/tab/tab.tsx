import { TabsTrigger, UsersIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

interface FollowerTabProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof followerTabVariants> {
  value: string;
  label: string;
  active: boolean;
  counter: number;
}

export const followerTabVariants = cva(
  "h-10 group select-none rounded-none cursor-pointer flex justify-between items-center border-b px-3 py-2.5 gap-4 grow data-[state=active]:shadow-none data-[state=active]:rounded data-[state=active]:cursor-default data-[state=active]:text-foreground-100 data-[state=active]:hover:text-foreground-100",
  {
    variants: {
      variant: {
        darkest:
          "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        darker:
          "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        dark: "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        default:
          "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        light:
          "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        lighter:
          "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        lightest:
          "bg-background-100 border-background-200 text-foreground-300 hover:text-foreground-200 data-[state=active]:bg-background-200",
        ghost:
          "border-background-transparent text-foreground-300 hover:text-foreground-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const FollowerTab = ({
  value,
  label,
  active,
  counter,
  variant,
  className,
}: FollowerTabProps) => {
  return (
    <TabsTrigger
      data-state={active ? "active" : "inactive"}
      value={value}
      className={cn(followerTabVariants({ variant }), className)}
    >
      <p className="text-sm font-medium">{label}</p>
      <div
        className={cn(
          "px-2 py-1 flex items-center rounded-full bg-background-200 text-foreground-300 group-hover:text-foreground-200 transition-colors",
          active &&
            "bg-background-300 text-foreground-100 group-hover:text-foreground-100",
        )}
      >
        <UsersIcon variant="solid" size="xs" />
        <p className="px-0.5 text-xs font-semibold tracking-wider">{counter}</p>
      </div>
    </TabsTrigger>
  );
};

export default FollowerTab;
