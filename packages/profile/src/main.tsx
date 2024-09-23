import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
