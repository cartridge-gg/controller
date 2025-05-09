import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectibleTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleTagVariants> {
  label: string;
  hover?: boolean;
}

const collectibleTagVariants = cva(
  "relative px-1 py-0.5 rounded-sm h-6 flex justify-center items-center text-sm tracking-wider font-semibold select-none",
  {
    variants: {
      variant: {
        default: "text-foreground-100 bg-[#1E221FA3] backdrop-blur-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleTag({
  label,
  variant,
  className,
  children,
  ...props
}: CollectibleTagProps) {
  return (
    <div
      className={cn(collectibleTagVariants({ variant }), className)}
      {...props}
    >
      {children}
      <p className="px-0.5">{label}</p>
    </div>
  );
}

export default CollectibleTag;
