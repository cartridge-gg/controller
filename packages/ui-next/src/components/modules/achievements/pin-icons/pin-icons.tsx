import { cva, VariantProps } from "class-variance-authority";
import { AchievementPinIcon } from "../pin-icon";

const achievementPinsVariants = cva("flex items-center gap-1.5", {
  variants: {
    variant: {
      default: "",
      faded: "",
      ghost: "",
    },
    size: {
      xs: "",
      default: "",
      md: "",
    },
    status: {
      default: "",
      highlight: "",
      hover: "",
    },
  },
  defaultVariants: {
    variant: "default",
    status: "default",
  },
});

export interface AchievementPinIconsProps
  extends VariantProps<typeof achievementPinsVariants> {
  pins: { id: string; icon: string }[];
}

export const AchievementPinIcons = ({
  pins,
  variant,
  size,
  status,
}: AchievementPinIconsProps) => {
  return (
    <div className={achievementPinsVariants({ variant, status, size })}>
      {pins.map((value) => (
        <AchievementPinIcon
          key={value.id}
          icon={value.icon}
          variant={variant}
          size={size}
          status={status}
        />
      ))}
      {Array.from({ length: 3 - pins.length }).map((_, index) => (
        <AchievementPinIcon
          key={index}
          empty
          variant={variant}
          size={size}
          status={status}
        />
      ))}
    </div>
  );
};

export default AchievementPinIcons;
