import { GearIcon, LayoutContainer } from "@cartridge/ui";
import { NavigationHeader } from "@/components";
import { useConnection } from "@/hooks/connection";
import { Outlet, useLocation } from "react-router-dom";
import { LayoutBottomNav } from "@/components/bottom-nav";

export function Layout({ children }: { children?: React.ReactNode }) {
  const { closeModal } = useConnection();
  const location = useLocation();
  // Check if current page should have bottom navigation
  const hasBottomNav = [
    "inventory",
    "achievements",
    "leaderboard",
    "activity",
  ].some((page) => location.pathname.endsWith(`/${page}`));

  return (
    <div style={{ position: "relative" }}>
      <LayoutContainer>
        <NavigationHeader
          variant="hidden"
          forceShowClose={hasBottomNav}
          icon={<GearIcon />}
          onClose={hasBottomNav ? closeModal : undefined}
        />

        {children || <Outlet />}

        {hasBottomNav && <LayoutBottomNav />}
      </LayoutContainer>
    </div>
  );
}
