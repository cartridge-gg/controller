import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";
import { NavigationProvider } from "@/context/navigation";
import { BrowserRouter } from "react-router-dom";
import Controller from "./utils/controller";

import "./index.css";

// Controller type is already declared in vite-env.d.ts
async function bootstrap() {
  window.controller = await Controller.fromStore();

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
