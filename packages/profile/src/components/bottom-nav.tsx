import { Link, useLocation } from "react-router-dom";
import {
  LayoutBottomTabs,
  ChestIcon,
  TrophyIcon,
  ClockIcon,
  BottomTab,
} from "@cartridge/ui-next";
import { useMemo } from "react";

export function LayoutBottomNav() {
  const { pathname } = useLocation();
  const active = useMemo<
    "inventory" | "trophies" | "achievements" | "activity"
  >(() => {
    if (pathname.includes("inventory")) return "inventory";
    if (pathname.includes("achievements")) return "achievements";
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
          <ChestIcon
            variant={active === "inventory" ? "solid" : "line"}
            size="lg"
          />
        </Link>
      </BottomTab>
      <BottomTab status={active === "achievements" ? "active" : undefined}>
        <Link
          to="../achievements"
          className="h-full w-full flex items-center justify-center"
        >
          <TrophyIcon
            size="lg"
            variant={active === "achievements" ? "solid" : "line"}
          />
        </Link>
      </BottomTab>
      <BottomTab status={active === "activity" ? "active" : undefined}>
        <Link
          to="../activity"
          className="h-full w-full flex items-center justify-center"
        >
          <ClockIcon
            size="lg"
            variant={active === "activity" ? "solid" : "line"}
          />
        </Link>
      </BottomTab>
    </LayoutBottomTabs>
  );
}
