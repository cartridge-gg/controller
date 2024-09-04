import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Inventory } from "@/components/inventory";
import { Provider } from "@/components/provider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <Inventory />
    </Provider>
  </StrictMode>,
);
