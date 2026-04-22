import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import { Verification } from "@/components/purchasenew/verification";
import { Drawer } from "@cartridge/controller-ui";

export type DrawerId = "verification";

export type VerificationOptions = {
  method: "coinflow" | "apple-pay";
};

export type DrawerOptions = VerificationOptions;

interface DrawerContextType {
  currentDrawerId: DrawerId | null;
  openDrawer: (
    drawerId: DrawerId | null | undefined,
    options?: DrawerOptions,
  ) => void;
  closeDrawer: () => void;
  // typed for each drawer
  verificationOptions: VerificationOptions;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [currentDrawerId, setCurrentDrawerId] = useState<DrawerId | null>(null);
  const [currentDrawerOptions, setCurrentDrawerOptions] =
    useState<DrawerOptions | null>(null);

  const [debouncedDrawerId, setDebouncedDrawerId] = useState<DrawerId | null>(
    null,
  );
  useEffect(() => {
    if (currentDrawerId) {
      setDebouncedDrawerId(currentDrawerId);
    } else {
      setTimeout(() => {
        setDebouncedDrawerId(null);
      }, 300);
    }
  }, [currentDrawerId]);

  const openDrawer = useCallback(
    (drawerId: DrawerId | null | undefined, options?: DrawerOptions) => {
      setCurrentDrawerId(drawerId ?? null);
      if (options) {
        setCurrentDrawerOptions(options);
      }
    },
    [],
  );
  const closeDrawer = () => openDrawer(null);

  // close drawer if route changes
  const location = useLocation();
  useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  const value: DrawerContextType = {
    currentDrawerId,
    verificationOptions: currentDrawerOptions as VerificationOptions,
    openDrawer,
    closeDrawer,
  };

  return (
    <DrawerContext.Provider value={value}>
      {children}
      {debouncedDrawerId == "verification" && (
        <Drawer
          isOpen={currentDrawerId !== null}
          onClose={closeDrawer}
        >
          <Verification />
        </Drawer>
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawerContext() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a DrawerProvider");
  }
  return context;
}
