import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

export const activityDetailsVariants = cva("flex p-3", {
  variants: {
    variant: {
      default: "bg-background-200 text-foreground-400 rounded-t",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ActivityDetailsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityDetailsVariants> {}

export const ActivityDetails = ({
  variant,
  className,
  children,
}: ActivityDetailsProps) => {
  return (
    <div className="flex flex-col gap-y-px">
      <div className={cn(activityDetailsVariants({ variant }), className)}>
        <p className="text-xs font-semibold tracking-wider">Details</p>
      </div>
      {children}
    </div>
  );
};

export default ActivityDetails;
