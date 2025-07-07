import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { ProfileApp } from "#profile/components/app";
import { Provider } from "#profile/components/provider";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <ProfileApp />
      </Provider>
    </BrowserRouter>
    <SonnerToaster position="bottom-right" />
  </StrictMode>,
);
