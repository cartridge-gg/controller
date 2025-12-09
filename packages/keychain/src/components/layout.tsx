import { NavigationHeader } from "@/components";
import { LayoutBottomNav } from "@/components/bottom-nav";
import { useConnection } from "@/hooks/connection";
import { GearIcon, LayoutContainer } from "@cartridge/ui";
import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function Layout({ children }: { children?: React.ReactNode }) {
  const { closeModal, onModalClose } = useConnection();
  const location = useLocation();
  // Check if current page should have bottom navigation
  const hasBottomNav = useMemo(() => {
    return [
      "inventory",
      "achievements",
      "quests",
      "leaderboard",
      "activity",
    ].some((page) => location.pathname.endsWith(`/${page}`));
  }, [location]);

  return (
    <div style={{ position: "relative" }}>
      <LayoutContainer>
        <NavigationHeader
          variant="hidden"
          forceShowClose={hasBottomNav}
          icon={<GearIcon />}
          onClose={hasBottomNav ? closeModal : onModalClose}
        />

        {children || <Outlet />}

        {hasBottomNav && <LayoutBottomNav />}
      </LayoutContainer>
    </div>
  );
}
