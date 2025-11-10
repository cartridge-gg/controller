import { useMediaQuery } from "@cartridge/ui";
import { isIframe } from "@cartridge/ui/utils";
import { useEffect, useState } from "react";

enum DeviceType {
  MOBILE = 0,
  DESKTOP = 1,
}

const DESKTOP_WIDTH = 432;

// Helper function to get the effective window width
const getEffectiveWindowWidth = () => {
  if (typeof window === "undefined") return 0;

  if (isIframe()) {
    try {
      // Try to access parent window dimensions
      return window.parent.innerWidth;
    } catch {
      // For keychain iframe, assume desktop unless screen indicates mobile
      const screenWidth = window.screen?.width || 1024;
      return screenWidth;
    }
  }

  // Use current window width, but handle case where it might be 0
  return window.innerWidth || window.screen?.width || 1024;
};

// Helper function to detect mobile device immediately
const isMobileDevice = () => {
  return getEffectiveWindowWidth() < DESKTOP_WIDTH;
};

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>(
    isMobileDevice() ? DeviceType.MOBILE : DeviceType.DESKTOP,
  );

  const isPWA = useMediaQuery("(display-mode: standalone)");

  useEffect(() => {
    const handleResize = () => {
      setDevice(
        getEffectiveWindowWidth() < DESKTOP_WIDTH
          ? DeviceType.MOBILE
          : DeviceType.DESKTOP,
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobile: device === DeviceType.MOBILE,
    isDesktop: device === DeviceType.DESKTOP,
    isPWA,
  };
}
