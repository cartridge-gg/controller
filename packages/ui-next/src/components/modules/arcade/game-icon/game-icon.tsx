import { cn, DojoIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

const arcadeGameIconVariants = cva(
  "p-0.5 flex justify-center items-center rounded",
  {
    variants: {
      variant: {
        default: "bg-background-300 data-[active=true]:bg-background-400",
        faded: "bg-background-200 data-[active=true]:bg-background-300",
        ghost: "",
      },
      size: {
        default: "w-8 h-8",
        lg: "w-9 h-9",
        xl: "w-11 h-11 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeGameIconProps
  extends VariantProps<typeof arcadeGameIconVariants> {
  logo?: string;
  name?: string;
  active?: boolean;
  className?: string;
}

export const ArcadeGameIcon = ({
  logo,
  name,
  active,
  className,
  variant,
  size,
}: ArcadeGameIconProps) => {
  return (
    <div
      data-active={active}
      className={cn(arcadeGameIconVariants({ variant, size }), className)}
    >
      {logo ? (
        <img src={logo} alt={name} className="h-full w-full rounded" />
      ) : (
        <DojoIcon size={size} />
      )}
    </div>
  );
};

export default ArcadeGameIcon;
