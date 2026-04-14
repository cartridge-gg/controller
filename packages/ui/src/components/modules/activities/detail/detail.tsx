import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

export const activityDetailVariants = cva(
  "flex justify-between items-center gap-3 p-3 select-none",
  {
    variants: {
      variant: {
        default: "bg-background-200 text-foreground-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActivityDetailProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof activityDetailVariants> {
  label: string;
  status?: "success" | "fail";
}

export const ActivityDetail = ({
  label,
  status,
  variant,
  className,
  children,
}: ActivityDetailProps) => {
  return (
    <div className={cn(activityDetailVariants({ variant }), className)}>
      <p className="text-sm">{label}</p>
      <div
        data-status={status}
        className="text-sm text-foreground-100 data-[status=success]:text-constructive-100 data-[status=fail]:text-destructive-100"
      >
        {children}
      </div>
    </div>
  );
};

export default ActivityDetail;
