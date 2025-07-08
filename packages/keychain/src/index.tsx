import "./index.css";

import { registerRootComponent } from "expo";
// import { StrictMode } from "react";
// import { SonnerToaster } from "@cartridge/ui";
// import { App } from "../src/components/app";
// import { Provider } from "../src/components/provider";
import { Text } from "react-native";
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

  return <Text className="text-[yellow]">Keychain App</Text>;
  // return (
  //   <StrictMode>
  //     <Provider>
  //       <App />
  //     </Provider>
  //     <SonnerToaster position="bottom-right" />
  //   </StrictMode>
  // );
}

registerRootComponent(KeychainApp);
