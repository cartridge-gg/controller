import { cn } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const achievementPinIconVariants = cva(
  "border rounded flex justify-center items-center",
  {
    variants: {
      variant: {
        default: "border-background-300 bg-background-200",
        faded: "border-background-200 bg-background-100",
        ghost: "",
      },
      size: {
        xs: "w-5 h-5",
        default: "w-5 h-5 md:w-6 md:h-6",
        md: "w-6 h-6",
      },
      status: {
        default: "text-foreground-100",
        highlight: "text-primary border-background-400 bg-background-300",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      status: "default",
    },
  },
);

export interface AchievementPinIconProps
  extends VariantProps<typeof achievementPinIconVariants> {
  icon?: string;
  empty?: boolean;
}

export const AchievementPinIcon = ({
  icon,
  empty,
  variant,
  size,
  status,
}: AchievementPinIconProps) => {
  return (
    <div className={achievementPinIconVariants({ variant, size, status })}>
      {empty ? (
        <div
          className={cn(
            "w-3 h-3 fa-spider-web fa-thin text-background-500",
            status === "highlight" && "text-foreground-400",
          )}
        />
      ) : (
        <div className={cn("w-3 h-3 fa-solid", icon || "fa-trophy")} />
      )}
    </div>
  );
};

export default AchievementPinIcon;
