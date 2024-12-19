import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui-next";
import { App } from "@/components/app";
import { Provider } from "@/components/Provider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
    <SonnerToaster position="bottom-right" />
  </StrictMode>,
);
