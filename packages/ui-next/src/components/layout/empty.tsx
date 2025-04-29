import {
  cn,
  EmptyStateAchievementIcon,
  EmptyStateActivityIcon,
  EmptyStateGuildIcon,
  EmptyStateIcon,
  EmptyStateInventoryIcon,
} from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { EmptyStateDiscoverIcon } from "../icons/utility/empty-state-discover";

interface EmptyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyVariants> {
  title?: string;
  icon?: "activity" | "achievement" | "guild" | "inventory" | "discover";
}

export const emptyVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
  },
});

export function Empty({
  title = "Something went wrong",
  icon,
  variant,
  className,
  ...props
}: EmptyProps) {
  const Icon = useMemo(() => {
    switch (icon) {
      case "activity":
        return <EmptyStateActivityIcon className="h-[135px] w-[135px]" />;
      case "achievement":
        return <EmptyStateAchievementIcon className="h-[135px] w-[135px]" />;
      case "guild":
        return <EmptyStateGuildIcon className="h-[135px] w-[135px]" />;
      case "inventory":
        return <EmptyStateInventoryIcon className="h-[135px] w-[135px]" />;
      case "discover":
        return <EmptyStateDiscoverIcon className="h-[135px] w-[135px]" />;
      default:
        return <EmptyStateIcon className="h-[135px] w-[135px]" />;
    }
  }, [icon]);

  return (
    <div className={cn(emptyVariants({ variant }), className)} {...props}>
      <div
        className="h-full flex flex-col gap-2 justify-center items-center select-none rounded px-2 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23242824' stroke-width='2' stroke-dasharray='3%2c 6' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
        }}
      >
        {Icon}
        <p className="text-sm text-background-500">{title}</p>
      </div>
    </div>
  );
}
