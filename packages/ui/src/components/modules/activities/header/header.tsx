import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export const activityHeaderVariants = cva(
  "flex flex-col items-center gap-6 text-foreground-200 data-[loading]:text-foreground-300 data-[error]:text-destructive-100",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default: "",
        light: "",
        lighter: "",
        lightest: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActivityHeaderProps
  extends VariantProps<typeof activityHeaderVariants> {
  Logo: React.ReactNode;
  title: string;
  topic?: string;
  subTopic?: string | React.ReactNode;
  error?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActivityHeader = ({
  Logo,
  title,
  topic,
  subTopic,
  error,
  loading,
  variant,
  className,
}: ActivityHeaderProps) => {
  return (
    <div
      data-loading={loading}
      data-error={error}
      className={cn(activityHeaderVariants({ variant }), className)}
    >
      <p className="text-lg/[22px] font-semibold">{title}</p>
      {Logo}
      <div className="flex flex-col items-center">
        <p
          data-error={error}
          data-loading={loading}
          className="text-2xl/[29px] font-semibold text-foreground-100 data-[error]:text-destructive-100 data-[loading]:text-foreground-300"
        >
          {topic}
        </p>
        <p
          data-error={error}
          data-loading={loading}
          className="text-sm text-foreground-300 data-[error]:text-destructive-100 data-[loading]:text-foreground-300"
        >
          {error ? "Failed" : subTopic}
        </p>
      </div>
    </div>
  );
};

export default ActivityHeader;
