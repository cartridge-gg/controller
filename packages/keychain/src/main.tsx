import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui-next";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "@/components/app";
import { Provider } from "@/components/provider";

import "./index.css";
import Controller from "./utils/controller";

declare global {
  interface Window {
    controller: ReturnType<typeof Controller.fromStore>;
  }
}

// Initialize controller before React rendering
window.controller = Controller.fromStore(import.meta.env.VITE_ORIGIN!);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <App />
      </Provider>
    </QueryClientProvider>
    <SonnerToaster position="bottom-right" />
  </StrictMode>,
);
