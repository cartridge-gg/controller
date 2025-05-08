import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface TokenSummaryProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tokenSummaryVariants> {}

const tokenSummaryVariants = cva(
  "rounded overflow-y-scroll w-full flex flex-col gap-y-px",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const TokenSummary = ({
  variant,
  className,
  children,
  ...props
}: TokenSummaryProps) => {
  return (
    <div
      className={cn(tokenSummaryVariants({ variant }), className)}
      {...props}
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
};

export default TokenSummary;
