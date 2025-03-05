import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui-next";
import { App } from "#components/app";
import { Provider } from "#components/provider";

import "./index.css";
import Controller from "./utils/controller";

declare global {
  interface Window {
    controller: ReturnType<typeof Controller.fromStore>;
  }
}

// Initialize controller before React rendering
window.controller = Controller.fromStore(import.meta.env.VITE_ORIGIN!);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
    <SonnerToaster position="bottom-right" />
  </StrictMode>,
);
