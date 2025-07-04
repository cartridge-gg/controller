import { Link, useLocation } from "react-router-dom";
import {
  LayoutBottomTabs,
  ChestIcon,
  TrophyIcon,
  BottomTab,
  PulseIcon,
  LeaderboardIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useMemo } from "react";
import { useConnection } from "#profile-hooks/context";

export function LayoutBottomNav() {
  const { pathname } = useLocation();
  const { namespace } = useConnection();

  const active = useMemo<
    "inventory" | "trophies" | "achievements" | "leaderboard" | "activity"
  >(() => {
    if (pathname.includes("inventory")) return "inventory";
    if (pathname.includes("achievements")) return "achievements";
    if (pathname.includes("leaderboard")) return "leaderboard";
    if (pathname.includes("activity")) return "activity";

    return "inventory";
  }, [pathname]);

  return (
    <LayoutBottomTabs>
      <BottomTab status={active === "inventory" ? "active" : undefined}>
        <Link
          to="../inventory"
          className="h-full w-full flex items-center justify-center"
        >
          <ChestIcon variant="solid" size="lg" />
        </Link>
      </BottomTab>
      <BottomTab
        status={active === "achievements" ? "active" : undefined}
        className={cn(!namespace && "hidden")}
      >
        <Link
          to="../achievements"
          className="h-full w-full flex items-center justify-center"
        >
          <TrophyIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
      <BottomTab
        status={active === "leaderboard" ? "active" : undefined}
        className={cn(!namespace && "hidden")}
      >
        <Link
          to="../leaderboard"
          className="h-full w-full flex items-center justify-center"
        >
          <LeaderboardIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
      <BottomTab status={active === "activity" ? "active" : undefined}>
        <Link
          to="../activity"
          className="h-full w-full flex items-center justify-center"
        >
          <PulseIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
    </LayoutBottomTabs>
  );
}
