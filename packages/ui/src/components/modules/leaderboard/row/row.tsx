import {
  BronzeTagIcon,
  GoldTagIcon,
  SilverTagIcon,
  SparklesIcon,
  LeaderboardUsername,
} from "@/index";
import { cn } from "@/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { FollowerMark } from "../../followers/mark";

export interface LeaderboardRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rank: number;
  name: string;
  points: number;
  icon?: string;
  highlight?: boolean;
  following?: boolean;
}

export const LeaderboardRow = ({
  rank,
  name,
  points,
  icon,
  highlight,
  following,
  className,
  onClick,
  ...props
}: LeaderboardRowProps) => {
  const [sticky, setSticky] = useState(false);
  const ref = useRef(null);

  const Tag = useMemo(() => {
    switch (rank) {
      case 1:
        return <GoldTagIcon size="sm" />;
      case 2:
        return <SilverTagIcon size="sm" />;
      case 3:
        return <BronzeTagIcon size="sm" />;
      default:
        return null;
    }
  }, [rank]);

  useEffect(() => {
    const cachedRef = ref.current;
    if (!highlight || !cachedRef) return;
    // If the component is sticked to the top or bottom of its parent
    // we need to add a border to the top or bottom of the component
    const options = { threshold: [1] };
    const observer = new IntersectionObserver(([entry]) => {
      setSticky(entry.intersectionRatio < 1);
    }, options);
    observer.observe(cachedRef);
    return () => {
      if (cachedRef) observer.unobserve(cachedRef);
    };
  }, [ref, highlight]);

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-11 flex select-none py-2.5 px-3 justify-between bg-background-200 text-foreground-400 transition-colors border-y border-transparent",
        !!onClick &&
          "group hover:bg-background-300 hover:text-foreground-300 cursor-pointer",
        highlight &&
          "bg-background-300 text-foreground-300 sticky top-[-1px] bottom-[-1px] z-10",
        highlight && sticky && "border-spacer-100",
        className,
      )}
      {...props}
    >
      <div className="flex gap-x-2 items-center">
        <div className="flex w-11 justify-between items-center">
          <p className="text-sm">{`${rank}.`}</p>
          {Tag}
        </div>
        <LeaderboardUsername
          username={name}
          icon={icon}
          highlight={highlight}
        />
      </div>
      <div className="flex gap-x-3 items-center">
        {following !== undefined && (
          <FollowerMark
            active={following}
            variant="default"
            className={highlight ? "hidden" : ""}
          />
        )}
        <div
          className={cn(
            "flex gap-1 min-w-14 justify-end",
            highlight ? "text-primary" : "text-foreground-100",
          )}
        >
          <SparklesIcon variant={highlight ? "solid" : "line"} size="sm" />
          <p className="text-sm">{points}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRow;
