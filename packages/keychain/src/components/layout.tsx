import { LayoutContainer } from "@cartridge/ui";
import { NavigationHeader } from "@/components";
import { useConnection } from "@/hooks/connection";
import { Slot, usePathname } from "expo-router";
import { LayoutBottomNav } from "@/components/bottom-nav";

export function Layout({ children }: { children?: React.ReactNode }) {
  const { closeModal } = useConnection();
  const pathname = usePathname();
  // Check if current page should have bottom navigation
  const hasBottomNav = [
    "inventory",
    "achievements",
    "leaderboard",
    "activity",
  ].some((page) => pathname.endsWith(`/${page}`));

  return (
    <div style={{ position: "relative" }}>
      <LayoutContainer>
        <NavigationHeader
          variant="hidden"
          forceShowClose={hasBottomNav}
          onClose={hasBottomNav ? closeModal : undefined}
        />

        {children || <Slot />}

        {hasBottomNav && <LayoutBottomNav />}
      </LayoutContainer>
    </div>
  );
}
