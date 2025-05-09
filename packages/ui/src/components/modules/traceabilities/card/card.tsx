import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export const traceabilityCardVariants = cva(
  "select-none rounded p-3 pr-4 flex items-center justify-between gap-4 text-foreground-100 data-[loading]:text-foreground-300 data-[error]:text-destructive-100",
  {
    variants: {
      variant: {
        default: "bg-background-200 hover:bg-background-300 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TraceabilityCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof traceabilityCardVariants> {
  Logo: React.ReactNode;
  title: string;
  from: string;
  to: string;
  count?: number;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const TraceabilityCard = ({
  Logo,
  title,
  from,
  to,
  count,
  error,
  loading,
  variant,
  className,
  ...props
}: TraceabilityCardProps) => {
  return (
    <div
      data-loading={loading}
      data-error={error}
      className={cn(traceabilityCardVariants({ variant }), className)}
      {...props}
    >
      {Logo}
      <div className="flex flex-col gap-0.5 items-stretch grow overflow-hidden">
        <div
          data-error={error}
          className="flex items-center gap-6 justify-between text-sm font-medium capitalize data-[error]:text-destructive-100"
        >
          <p>{title}</p>
          {count && <p>{count}</p>}
        </div>
        <div
          data-error={error}
          className="flex items-center gap-1 justify-between text-xs text-foreground-300 data-[error]:text-destructive-100"
        >
          <p>{from}</p>
          <p>{to}</p>
        </div>
      </div>
    </div>
  );
};

export default TraceabilityCard;
