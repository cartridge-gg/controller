import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectiblePillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectiblePillVariants> {
  label: string;
  hover?: boolean;
}

const collectiblePillVariants = cva(
  "px-1.5 py-0.5 rounded-full h-5 flex justify-center items-center text-xs tracking-wider font-semibold select-none",
  {
    variants: {
      variant: {
        default: "bg-background-300 data-[hover=true]:bg-background-400",
        faded: "bg-background-200 data-[hover=true]:bg-background-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectiblePill({
  label,
  hover,
  variant,
  className,
  ...props
}: CollectiblePillProps) {
  return (
    <div
      data-hover={hover}
      className={cn(collectiblePillVariants({ variant }), className)}
      {...props}
    >
      {label}
    </div>
  );
}

export default CollectiblePill;
