import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { Button } from "@/index";

interface FollowerUnfollowProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof followerUnfollowVariants> {
  loading: boolean;
  disabled: boolean;
}

export const followerUnfollowVariants = cva(
  "w-[88px] h-8 group transition-colors normal-case tracking-normal font-sans font-normal font-medium border border-transparent rounded",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default:
          "bg-background-300 text-foreground-100 hover:bg-background-400 hover:text-destructive-100",
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

export const FollowerUnfollow = ({
  loading,
  disabled,
  variant,
  className,
  ...props
}: FollowerUnfollowProps) => {
  return (
    <Button
      isLoading={loading}
      disabled={disabled}
      variant="secondary"
      className={cn(followerUnfollowVariants({ variant }), className)}
      {...props}
    >
      <p className="text-sm font-medium">Unfollow</p>
    </Button>
  );
};

export default FollowerUnfollow;
