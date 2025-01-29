import { Link, useLocation } from "react-router-dom";
import {
  LayoutBottomTabs,
  cn,
  ChestIcon,
  TrophyIcon,
  ClockIcon,
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
      <Link
        to="../inventory"
        className={cn(
          "flex-1 flex items-center justify-center text-muted-foreground",
          active === "inventory" && "border-t border-primary",
        )}
      >
        <ChestIcon
          size="lg"
          className={active === "inventory" ? "text-primary" : undefined}
        />
      </Link>
      <Link
        to="../achievements"
        className={cn(
          "flex-1 flex items-center justify-center text-muted-foreground",
          active === "achievements" && "border-t border-primary",
        )}
      >
        <TrophyIcon
          size="lg"
          variant={active === "achievements" ? "solid" : "line"}
          className={active === "achievements" ? "text-primary" : undefined}
        />
      </Link>
      <Link
        to="../activity"
        className={cn(
          "flex-1 flex items-center justify-center text-muted-foreground",
          active === "activity" && "border-t border-primary",
        )}
      >
        <ClockIcon
          size="lg"
          variant={active === "activity" ? "solid" : "line"}
          className={active === "activity" ? "text-primary" : undefined}
        />
      </Link>
    </LayoutBottomTabs>
  );
}
