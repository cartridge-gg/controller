import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "../components/app";
import { Provider } from "../components/provider";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
    <SonnerToaster position="bottom-right" />
  </StrictMode>,
);
