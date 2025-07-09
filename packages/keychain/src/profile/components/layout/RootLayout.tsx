import { LayoutContainer, LayoutContent } from "@cartridge/ui";
import { LayoutBottomNav } from "#profile/components/bottom-nav";
import { NavigationHeader } from "@/components";
import { useConnection } from "@/hooks/connection";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { closeModal } = useConnection();

  return (
    <LayoutContainer>
      <NavigationHeader variant="hidden" onClose={closeModal} />

      <LayoutContent className="flex flex-col pt-6 pb-6 gap-6 overflow-y-auto">
        {children}
      </LayoutContent>

      <LayoutBottomNav />
    </LayoutContainer>
  );
}
