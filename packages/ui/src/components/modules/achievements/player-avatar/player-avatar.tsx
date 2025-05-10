import { OlmechIcon } from "@/components/icons";
import { VariantProps } from "class-variance-authority";
import { useMemo } from "react";

export interface AchievementPlayerAvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  username: string;
  size?: VariantProps<typeof OlmechIcon>["size"];
}

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
