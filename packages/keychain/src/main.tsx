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

// Initialize controller before React rendering
window.controller = Controller.fromStore(process.env.EXPO_PUBLIC_ORIGIN!);

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
