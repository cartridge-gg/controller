import { OlmechIcon } from "@/components/icons";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

export interface AchievementPlayerAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerAvatarVariants> {
  username: string;
  size?: VariantProps<typeof OlmechIcon>["size"];
}

const achievementPlayerAvatarVariants = cva("flex items-center gap-x-4", {
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
    rank: {
      default: "",
      gold: "",
      silver: "",
      bronze: "",
    },
  },
  defaultVariants: {
    variant: "default",
    rank: "default",
  },
});

export const AchievementPlayerAvatar = ({
  username,
  size,
  className,
}: AchievementPlayerAvatarProps) => {
  const variant = useMemo(() => {
    const hash = username.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const index = hash % 8;
    switch (index) {
      case 1:
        return "two";
      case 2:
        return "three";
      case 3:
        return "four";
      case 4:
        return "eight";
      case 5:
        return "six";
      case 6:
        return "seven";
      case 7:
        return "five";
      case 0:
      default:
        return "one";
    }
  }, [username]);

  return <OlmechIcon size={size} variant={variant} className={className} />;
};

export default AchievementPlayerAvatar;
