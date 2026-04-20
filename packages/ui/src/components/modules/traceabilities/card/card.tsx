import { AchievementPlayerAvatar } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useEffect, useMemo, useState } from "react";

export const traceabilityCardVariants = cva(
  "select-none px-3 py-2.5 transition-colors flex items-center justify-between gap-4 overflow-hidden",
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
  username: string;
  timestamp: number;
  Icon: React.ReactNode;
}

export const TraceabilityCard = ({
  username,
  timestamp,
  Icon,
  variant,
  className,
  children,
  ...props
}: TraceabilityCardProps) => {
  const [state, setState] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    months: number;
    years: number;
  }>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    months: 0,
    years: 0,
  });

  useEffect(() => {
    if (!timestamp) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - timestamp * 1000;
      setState({
        seconds: Math.floor(diff / 1000),
        minutes: Math.floor(diff / (1000 * 60)),
        hours: Math.floor(diff / (1000 * 60 * 60)),
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        months: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)),
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const ellapsedTime = useMemo(() => {
    if (state.years > 0) return `${state.years}y`;
    if (state.months > 0) return `${state.months}mo`;
    if (state.days > 0) return `${state.days}d`;
    if (state.hours > 0) return `${state.hours}h`;
    if (state.minutes > 0) return `${state.minutes}m`;
    return `${state.seconds}s`;
  }, [state]);

  return (
    <div
      className={cn(traceabilityCardVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        <div className="flex items-center gap-1">
          <AchievementPlayerAvatar
            username={username}
            size="sm"
            className="shrink-0"
          />
          <div className="text-sm">{username}</div>
        </div>
        <div className="p-1 flex items-center justify-center bg-translucent-dark-100 rounded text-translucent-light-150">
          {Icon}
        </div>
        {children}
      </div>
      <div className="text-xs text-translucent-light-150 w-10 text-right">
        {ellapsedTime}
      </div>
    </div>
  );
};

export default TraceabilityCard;
