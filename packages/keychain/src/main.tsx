import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";
import { NavigationProvider } from "@/context/navigation";
import { BrowserRouter } from "react-router-dom";
import Controller from "./utils/controller";

import "./index.css";

function shouldResetPopupAuthStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const url = new URL(window.location.href);
  return (
    url.pathname === "/auth" && url.searchParams.get("action") === "connect"
  );
}

// Controller type is already declared in vite-env.d.ts
async function bootstrap() {
  if (shouldResetPopupAuthStorage()) {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("[bootstrap] Failed to clear popup auth storage:", error);
    }
    window.controller = undefined;
  } else {
    window.controller = await Controller.fromStore();
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <NavigationProvider>
          <Provider>
            <App />
          </Provider>
        </NavigationProvider>
        <SonnerToaster position="bottom-right" />
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap();
