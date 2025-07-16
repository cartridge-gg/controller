import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutBottomTabs,
  ChestIcon,
  TrophyIcon,
  BottomTab,
  PulseIcon,
  LeaderboardIcon,
} from "@cartridge/ui";
import { useMemo } from "react";

export function LayoutBottomNav() {
  const { pathname } = useLocation();
  const { username, project } = useParams<{
    username: string;
    project?: string;
  }>();

  const active = useMemo<
    "inventory" | "trophies" | "achievements" | "leaderboard" | "activity"
  >(() => {
    if (pathname.includes("inventory")) return "inventory";
    if (pathname.includes("achievements")) return "achievements";
    if (pathname.includes("leaderboard")) return "leaderboard";
    if (pathname.includes("activity")) return "activity";

    return "inventory";
  }, [pathname]);

  // Build the base path for navigation
  const basePath = useMemo(() => {
    if (project) {
      return `/account/${username}/slot/${project}`;
    }
    return `/account/${username}`;
  }, [username, project]);

  return (
    <LayoutBottomTabs>
      <BottomTab status={active === "inventory" ? "active" : undefined}>
        <Link
          to={`${basePath}/inventory`}
          className="h-full w-full flex items-center justify-center"
        >
          <ChestIcon variant="solid" size="lg" />
        </Link>
      </BottomTab>
      <BottomTab status={active === "achievements" ? "active" : undefined}>
        <Link
          to={`${basePath}/achievements`}
          className="h-full w-full flex items-center justify-center"
        >
          <TrophyIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
      <BottomTab status={active === "leaderboard" ? "active" : undefined}>
        <Link
          to={`${basePath}/leaderboard`}
          className="h-full w-full flex items-center justify-center"
        >
          <LeaderboardIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
      <BottomTab status={active === "activity" ? "active" : undefined}>
        <Link
          to={`${basePath}/activity`}
          className="h-full w-full flex items-center justify-center"
        >
          <PulseIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
    </LayoutBottomTabs>
  );
}
