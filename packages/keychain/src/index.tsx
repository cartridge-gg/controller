import "./index.css";
import "./globals";

import { registerRootComponent } from "expo";
import { StrictMode } from "react";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
// import { Provider } from "@/components/provider";
import Controller from "@/utils/controller";

declare global {
  interface Window {
    controller: ReturnType<typeof Controller.fromStore>;
  }
}

function KeychainApp() {
  // if (typeof window !== "undefined") {
  //   const origin = process.env.EXPO_PUBLIC_ORIGIN || "https://x.cartridge.gg";
  //   window.controller = Controller.fromStore(origin);
  // }

  return (
    <StrictMode>
      {/* <Provider> */}
      <App />
      <SonnerToaster position="bottom-right" />
      {/* </Provider> */}
    </StrictMode>
  );
}

registerRootComponent(KeychainApp);
