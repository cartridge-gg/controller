import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutBottomTabs,
  ChestIcon,
  TrophyIcon,
  BottomTab,
  PulseIcon,
  LeaderboardIcon,
  ScrollIcon,
} from "@cartridge/ui";
import { useMemo } from "react";
import { useConnection } from "@/hooks/connection";

export function LayoutBottomNav() {
  const { namespace, project } = useConnection();
  const { pathname, search } = useLocation();
  const { username } = useParams<{
    username: string;
  }>();

  const active = useMemo<
    | "inventory"
    | "trophies"
    | "achievements"
    | "quests"
    | "leaderboard"
    | "activity"
  >(() => {
    if (pathname.includes("inventory")) return "inventory";
    if (pathname.includes("achievements")) return "achievements";
    if (pathname.includes("quests")) return "quests";
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
          to={`${basePath}/inventory${search}`}
          className="h-full w-full flex items-center justify-center"
        >
          <ChestIcon variant="solid" size="lg" />
        </Link>
      </BottomTab>
      {project && namespace && (
        <BottomTab status={active === "achievements" ? "active" : undefined}>
          <Link
            to={`${basePath}/achievements${search}`}
            className="h-full w-full flex items-center justify-center"
          >
            <TrophyIcon size="lg" variant="solid" />
          </Link>
        </BottomTab>
      )}
      {project && namespace && (
        <BottomTab status={active === "quests" ? "active" : undefined}>
          <Link
            to={`${basePath}/quests${search}`}
            className="h-full w-full flex items-center justify-center"
          >
            <ScrollIcon size="lg" variant="solid" />
          </Link>
        </BottomTab>
      )}
      <BottomTab status={active === "leaderboard" ? "active" : undefined}>
        <Link
          to={`${basePath}/leaderboard${search}`}
          className="h-full w-full flex items-center justify-center"
        >
          <LeaderboardIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
      <BottomTab status={active === "activity" ? "active" : undefined}>
        <Link
          to={`${basePath}/activity${search}`}
          className="h-full w-full flex items-center justify-center"
        >
          <PulseIcon size="lg" variant="solid" />
        </Link>
      </BottomTab>
    </LayoutBottomTabs>
  );
}
