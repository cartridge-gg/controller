import { UniversalHeaderIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

const headerLabelVariants = cva("flex gap-x-4 items-center", {
  variants: {
    variant: {
      default: "text-foreground-100",
      ghost: "",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface UniversalHeaderLabelProps
  extends VariantProps<typeof headerLabelVariants> {
  label: string;
  icon?: string | React.ReactNode;
  className?: string;
}

export const UniversalHeaderLabel = ({
  label,
  icon,
  className,
  variant,
  size,
}: UniversalHeaderLabelProps) => {
  return (
    <div className={cn(headerLabelVariants({ variant, size }), className)}>
      <UniversalHeaderIcon icon={icon} variant={variant} size={size} />
      <p className="font-semibold text-lg/[22px]">{label}</p>
    </div>
  );
};

export default UniversalHeaderLabel;
