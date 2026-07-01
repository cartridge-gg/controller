import React from "react";
import ReactDOM from "react-dom/client";
import { StarknetProvider } from "./StarknetProvider";
import { App } from "./App";
import { ControllerToaster } from "@cartridge/controller/react";
import "@cartridge/controller/react/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StarknetProvider>
      <App />
      <ControllerToaster />
    </StarknetProvider>
  </React.StrictMode>,
);
