import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import FollowerUnfollow from "./unfollow";
import FollowerFollowing from "./following";
import FollowerFollow from "./follow";

interface FollowerActionProps
  extends HTMLAttributes<HTMLButtonElement | HTMLDivElement>,
    VariantProps<typeof followerActionVariants> {
  following: boolean;
  unfollowable: boolean;
  loading: boolean;
  disabled: boolean;
}

export const followerActionVariants = cva("", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
      light: "",
      lighter: "",
      lightest: "",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const FollowerAction = ({
  following,
  unfollowable,
  loading,
  disabled,
  variant,
  className,
  onClick,
  ...props
}: FollowerActionProps) => {
  if (following && unfollowable) {
    return (
      <FollowerUnfollow
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        variant={variant}
        className={className}
        {...props}
      />
    );
  }
  if (following) {
    return (
      <FollowerFollowing variant={variant} className={className} {...props} />
    );
  }
  return (
    <FollowerFollow
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      variant={variant}
      className={className}
      {...props}
    />
  );
};

export default FollowerAction;
