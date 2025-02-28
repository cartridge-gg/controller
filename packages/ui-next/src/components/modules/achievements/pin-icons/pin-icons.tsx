import { cva, VariantProps } from "class-variance-authority";
import { AchievementPinIcon } from "../pin-icon";

const achievementPinsVariants = cva("flex items-center gap-1.5", {
  variants: {
    variant: {
      default: "",
      faded: "",
      highlight: "",
      ghost: "",
    },
    size: {
      xs: "",
      default: "",
      md: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface AchievementPinIconsProps
  extends VariantProps<typeof achievementPinsVariants> {
  pins: { id: string; icon: string }[];
  theme?: boolean;
}

export const AchievementPinIcons = ({
  pins,
  theme,
  variant,
  size,
}: AchievementPinIconsProps) => {
  return (
    <div className={achievementPinsVariants({ variant, size })}>
      {pins.map((value) => (
        <AchievementPinIcon
          key={value.id}
          icon={value.icon}
          variant={variant}
          size={size}
          theme={theme}
        />
      ))}
      {Array.from({ length: 3 - pins.length }).map((_, index) => (
        <AchievementPinIcon
          key={index}
          empty
          variant={variant}
          size={size}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default AchievementPinIcons;
