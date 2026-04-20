import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

interface FollowerFollowingProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof followerFollowingVariants> {}

export const followerFollowingVariants = cva(
  "select-none w-[88px] h-8 border border-transparent rounded flex items-center justify-center",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default: "border-background-300 bg-background-200 text-foreground-300",
        light: "",
        lighter: "",
        lightest: "",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const FollowerFollowing = ({
  variant,
  className,
  ...props
}: FollowerFollowingProps) => {
  return (
    <div
      className={cn(followerFollowingVariants({ variant }), className)}
      {...props}
    >
      <p className="text-sm font-medium">Following</p>
    </div>
  );
};

export default FollowerFollowing;
