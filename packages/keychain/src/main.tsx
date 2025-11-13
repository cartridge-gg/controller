import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";
import { NavigationProvider } from "@/context/navigation";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Controller from "./utils/controller";

// Controller type is already declared in vite-env.d.ts

async function bootstrap() {
  window.controller = await Controller.fromStore(import.meta.env.VITE_ORIGIN!);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <NavigationProvider>
          <Provider>
            <App />
          </Provider>
        </NavigationProvider>
        <Toaster />
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap();
