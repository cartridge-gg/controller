import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";
import { NavigationProvider } from "@/context/navigation";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Controller from "./utils/controller";

declare global {
  interface Window {
    controller: ReturnType<typeof Controller.fromStore>;
  }
}

console.log("[Main] Starting app initialization");
console.log("[Main] Initial pathname:", window.location.pathname);
console.log("[Main] Initial href:", window.location.href);

// Initialize controller before React rendering
window.controller = Controller.fromStore(import.meta.env.VITE_ORIGIN!);
console.log("[Main] Controller initialized");

const root = document.getElementById("root");
console.log("[Main] Root element found:", !!root);

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

console.log("[Main] React app mounted");
