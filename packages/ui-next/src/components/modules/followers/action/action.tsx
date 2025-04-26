import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { Button } from "@/index";

interface FollowerActionProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof followerActionVariants> {
  following: boolean;
}

export const followerActionVariants = cva(
  "w-[88px] h-8 group transition-colors normal-case tracking-normal font-sans font-normal font-medium border border-transparent rounded",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default:
          "bg-background-300 text-foreground-100 hover:bg-primary-100 hover:text-primary-foreground data-[following=true]:border-background-300 data-[following=true]:bg-background-200 data-[following=true]:text-foreground-300 data-[following=true]:hover:bg-background-300 data-[following=true]:hover:text-destructive-100",
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

export const FollowerAction = ({
  following,
  variant,
  className,
  ...props
}: FollowerActionProps) => {
  return (
    <Button
      data-following={following}
      variant="secondary"
      className={cn(followerActionVariants({ variant }), className)}
      {...props}
    >
      {following ? (
        <>
          <p className="text-sm font-medium group-hover:hidden">Following</p>
          <p className="text-sm font-medium hidden group-hover:block">
            Unfollow
          </p>
        </>
      ) : (
        <p className="text-sm font-medium">Follow</p>
      )}
    </Button>
  );
};

export default FollowerAction;
