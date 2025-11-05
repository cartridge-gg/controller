import { NavigationHeader } from "@/components";
import { LayoutBottomNav } from "@/components/bottom-nav";
import { useConnection } from "@/hooks/connection";
import { GearIcon, LayoutContainer } from "@cartridge/ui";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { getCallbacks } from "@/utils/connection/callbacks";

export function Layout({ children }: { children?: React.ReactNode }) {
  const { closeModal, onModalClose } = useConnection();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Check if current page should have bottom navigation
  const hasBottomNav = [
    "inventory",
    "achievements",
    "leaderboard",
    "activity",
  ].some((page) => location.pathname.endsWith(`/${page}`));

  // Check if we're on a transaction-related page that needs special back handling
  const isTransactionPage = useMemo(() => {
    return (
      location.pathname.includes("/execute") ||
      location.pathname.includes("/sign")
    );
  }, [location.pathname]);

  // Handle back button on transaction pages to properly cancel
  const handleBack = useCallback(() => {
    if (isTransactionPage) {
      const id = searchParams.get("id");
      if (id) {
        const callbacks = getCallbacks(id);
        if (callbacks?.resolve) {
          // Cancel the transaction properly
          callbacks.resolve({
            code: ResponseCodes.ERROR,
            message: "User canceled",
            error: {
              message: "User canceled",
              code: 0,
            },
          });
        }
      }
      // Close the modal after cancelling
      if (closeModal) {
        closeModal();
      }
    }
  }, [isTransactionPage, searchParams, closeModal]);

  return (
    <div style={{ position: "relative" }}>
      <LayoutContainer>
        <NavigationHeader
          variant="hidden"
          forceShowClose={hasBottomNav}
          icon={<GearIcon />}
          onClose={hasBottomNav ? closeModal : onModalClose}
          onBack={isTransactionPage ? handleBack : undefined}
        />

        {children || <Outlet />}

        {hasBottomNav && <LayoutBottomNav />}
      </LayoutContainer>
    </div>
  );
}
