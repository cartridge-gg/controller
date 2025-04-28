import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { Button } from "@/index";

interface FollowerFollowProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof followerFollowVariants> {
  loading: boolean;
  disabled: boolean;
}

export const followerFollowVariants = cva(
  "w-[88px] h-8 group transition-colors normal-case tracking-normal font-sans font-normal font-medium border border-transparent rounded",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default:
          "bg-background-300 text-foreground-100 hover:bg-primary-100 hover:text-primary-foreground",
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

export const FollowerFollow = ({
  variant,
  className,
  loading,
  disabled,
  ...props
}: FollowerFollowProps) => {
  return (
    <Button
      isLoading={loading}
      disabled={disabled}
      variant="secondary"
      className={cn(followerFollowVariants({ variant }), className)}
      {...props}
    >
      <p className="text-sm font-medium">Follow</p>
    </Button>
  );
};

export default FollowerFollow;
