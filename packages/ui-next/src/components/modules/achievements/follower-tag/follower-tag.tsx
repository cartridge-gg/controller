import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

interface AchievementFollowerTagProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementFollowerTagVariants> {}

export const achievementFollowerTagVariants = cva(
  "border rounded px-1.5 py-0.5 text-xs",
  {
    variants: {
      variant: {
        darkest: "bg-background-100 border-background-200 text-foreground-400",
        darker: "bg-background-100 border-background-200 text-foreground-400",
        dark: "bg-background-100 border-background-200 text-foreground-400",
        default: "bg-background-100 border-background-200 text-foreground-400",
        light: "bg-background-125 border-background-200 text-foreground-400",
        lighter: "bg-background-125 border-background-200 text-foreground-400",
        lightest: "bg-background-125 border-background-200 text-foreground-400",
        ghost: "bg-transparent text-foreground-400 border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const AchievementFollowerTag = ({
  variant,
  className,
  ...props
}: AchievementFollowerTagProps) => {
  return (
    <p
      className={cn(achievementFollowerTagVariants({ variant }), className)}
      {...props}
    >
      Follows you
    </p>
  );
};

export default AchievementFollowerTag;
