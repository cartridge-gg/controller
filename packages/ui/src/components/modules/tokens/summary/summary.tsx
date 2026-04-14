import { CardContent } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface TokenSummaryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof tokenSummaryVariants> {
  title?: string | React.ReactNode;
}

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
  title,
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
      {title && (
        <CardContent className="text-foreground-400 text-xs font-semibold">
          {title}
        </CardContent>
      )}
      {children}
    </div>
  );
};

export default TokenSummary;
