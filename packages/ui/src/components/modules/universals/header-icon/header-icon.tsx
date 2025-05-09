import { SpaceInvaderIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

const headerIconVariants = cva("flex items-center justify-center rounded", {
  variants: {
    variant: {
      default: "bg-background-200 text-foreground-100",
      ghost: "",
    },
    size: {
      default: "w-11 h-11",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface UniversalHeaderIconProps
  extends VariantProps<typeof headerIconVariants> {
  icon: string | React.ReactNode;
  className?: string;
}

export const UniversalHeaderIcon = ({
  icon,
  variant,
  size,
  className,
}: UniversalHeaderIconProps) => {
  return (
    <div className={cn(headerIconVariants({ variant, size }), className)}>
      {typeof icon === "string" ? (
        icon.includes("fa-") ? (
          <div className={cn("w-6 h-6 fa-solid", icon)} />
        ) : (
          <img src={icon} alt="icon" className="w-9 h-9" />
        )
      ) : icon ? (
        icon
      ) : (
        <SpaceInvaderIcon variant="solid" size="lg" />
      )}
    </div>
  );
};

export default UniversalHeaderIcon;
