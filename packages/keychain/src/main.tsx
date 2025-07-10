import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";
import { BrowserRouter, useLocation } from "react-router-dom";
import "./index.css";
import Controller from "./utils/controller";

declare global {
  interface Window {
    controller: ReturnType<typeof Controller.fromStore>;
  }
}

// Initialize controller before React rendering
window.controller = Controller.fromStore(import.meta.env.VITE_ORIGIN!);

// Enhanced navigation logger component for dev mode
function NavigationLogger() {
  const location = useLocation();
  const previousLocationRef = useRef<string>("");

  useEffect(() => {
    if (import.meta.env.DEV) {
      const currentPath = location.pathname;
      const previousPath = previousLocationRef.current;

      console.log(`[Navigation] ${previousPath} → ${currentPath}`, {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        state: location.state,
      });

      previousLocationRef.current = currentPath;
    }
  }, [location.pathname, location.search, location.hash, location.state]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <NavigationLogger />
        <App />
      </Provider>
      <SonnerToaster position="bottom-right" />
    </BrowserRouter>
  </StrictMode>,
);
