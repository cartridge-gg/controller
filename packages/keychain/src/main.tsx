import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";
import { NavigationProvider } from "@/context/navigation";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Controller from "./utils/controller";
import { PurchaseProvider } from "./context";

declare global {
  interface Window {
    controller?: Awaited<ReturnType<typeof Controller.fromStore>>;
  }
}

async function bootstrap() {
  window.controller = await Controller.fromStore(import.meta.env.VITE_ORIGIN!);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <NavigationProvider>
          <Provider>
            <PurchaseProvider>
              <App />
            </PurchaseProvider>
          </Provider>
        </NavigationProvider>
        <SonnerToaster position="bottom-right" />
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap();
