import { cn, SpaceInvaderIcon, SparklesIcon } from "@/index";
import { useEffect, useRef, useState } from "react";
import { AchievementPinIcons } from "../pin-icons";

export interface AchievementLeaderboardRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  pins: { id: string; icon: string }[];
  rank: number;
  name: string;
  points: number;
  highlight?: boolean;
}

export const AchievementLeaderboardRow = ({
  pins,
  rank,
  name,
  points,
  highlight,
  className,
  ...props
}: AchievementLeaderboardRowProps) => {
  const [hover, setHover] = useState(false);
  const [sticky, setSticky] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!highlight || !ref.current) return;
    // If the component is sticked to the top or bottom of its parent
    // we need to add a border to the top or bottom of the component
    const options = { threshold: [1] };
    const observer = new IntersectionObserver(([entry]) => {
      setSticky(entry.intersectionRatio < 1);
    }, options);
    observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, highlight]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex select-none py-2.5 px-3 justify-between bg-background-200 text-foreground-400 hover:bg-background-300 hover:text-foreground-300 cursor-pointer",
        highlight &&
          "bg-background-300 text-foreground-300 sticky top-[-1px] bottom-[-1px] z-10",
        highlight && sticky && "border-y border-spacer-100",
        className,
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <div className="flex gap-x-1.5 items-center">
        <p className="w-9 text-sm">{`${rank}.`}</p>
        <div
          className={cn(
            "flex gap-1",
            highlight ? "text-primary" : "text-foreground-100",
          )}
        >
          <SpaceInvaderIcon variant="line" size="sm" />
          <p className="text-sm">{name}</p>
        </div>
      </div>
      <div className="flex gap-x-3 items-center">
        <AchievementPinIcons
          pins={pins}
          variant="default"
          size="md"
          status={highlight ? "highlight" : hover ? "hover" : "default"}
        />
        <div
          className={cn(
            "flex gap-1",
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

export default AchievementLeaderboardRow;
