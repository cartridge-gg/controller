import { cn } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const achievementPinIconVariants = cva(
  "border rounded flex justify-center items-center data-[theme=true]:text-primary transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-background-300 bg-background-200 text-foreground-100 data-[empty=true]:text-foreground-400",
        faded:
          "border-background-200 bg-background-100 text-foreground-100 data-[empty=true]:text-background-500",
        highlight:
          "border-background-400 bg-background-300 text-foreground-100 data-[empty=true]:text-foreground-400",
        ghost: "",
      },
      size: {
        xs: "w-5 h-5",
        default: "w-5 h-5 sm:w-6 sm:h-6",
        md: "w-6 h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface AchievementPinIconProps
  extends VariantProps<typeof achievementPinIconVariants> {
  icon?: string;
  empty?: boolean;
  theme?: boolean;
  className?: string;
}

export const AchievementPinIcon = ({
  icon,
  empty,
  theme,
  variant,
  size,
  className,
}: AchievementPinIconProps) => {
  return (
    <div
      data-theme={theme}
      data-empty={empty}
      className={cn(achievementPinIconVariants({ variant, size }), className)}
    >
      {empty ? (
        <div className="w-3 h-3 fa-spider-web fa-thin" />
      ) : (
        <div className={cn("w-3 h-3 fa-solid", icon || "fa-trophy")} />
      )}
    </div>
  );
};

export default AchievementPinIcon;
