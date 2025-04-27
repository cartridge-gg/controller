import { HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import {
  AchievementPlayerAvatar,
  FollowerAction,
  Separator,
  SparklesIcon,
} from "@/index";

interface FollowerSocialRowProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof followerSocialRowVariants> {
  username: string;
  following: boolean;
  unfollowable: boolean;
  onSocialClick: () => void;
  points?: number;
  loading?: boolean;
  disabled?: boolean;
}

export const followerSocialRowVariants = cva(
  "select-none flex justify-between items-center gap-4 h-11 pl-3 pr-1.5 py-2.5",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default: "bg-background-200",
        light: "",
        lighter: "",
        lightest: "",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const FollowerSocialRow = ({
  username,
  following,
  unfollowable,
  points,
  loading,
  disabled,
  onSocialClick,
  variant,
  className,
  ...props
}: FollowerSocialRowProps) => {
  return (
    <div
      className={cn(followerSocialRowVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          <AchievementPlayerAvatar username={username} size="sm" />
          <p className="text-sm font-medium px-0.5">{username}</p>
        </div>
        <Separator
          orientation="vertical"
          className={cn("w-px h-2 bg-background-400", !points && "hidden")}
        />
        <div
          className={cn(
            "flex items-center gap-1 text-foreground-300",
            !points && "hidden",
          )}
        >
          <SparklesIcon variant="line" size="sm" />
          <p className="text-sm font-medium">{points}</p>
        </div>
      </div>

      <FollowerAction
        following={following}
        unfollowable={unfollowable}
        onClick={onSocialClick}
        variant={variant}
        loading={!!loading}
        disabled={!!disabled}
      />
    </div>
  );
};

export default FollowerSocialRow;
