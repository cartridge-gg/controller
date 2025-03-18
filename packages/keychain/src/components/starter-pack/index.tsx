import { LayoutContainer, LayoutHeader, LayoutContent } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { useEffect } from "react";

export function StarterPack() {
  const { controller } = useConnection();

  useEffect(() => {
    if (!controller) return;
    // TODO: Implement the starter pack iframe content
    // This will be similar to how settings are handled
  }, [controller]);

  return (
    <LayoutContainer>
      <LayoutHeader
        title="Get Starter Pack"
        description="Claim your starter pack to begin your journey"
      />
      <LayoutContent>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-foreground-300">Starter pack content coming soon...</p>
        </div>
      </LayoutContent>
    </LayoutContainer>
  );
} 