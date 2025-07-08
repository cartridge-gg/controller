import { registerRootComponent } from "expo";
// import { StrictMode } from "react";
// import { SonnerToaster } from "@cartridge/ui";
// import { App } from "../src/components/app";
// import { Provider } from "../src/components/provider";
import { Text } from "react-native";
// import Controller from "@/utils/controller";

import "./index.css";

// declare global {
//   interface Window {
//     controller: ReturnType<typeof Controller.fromStore>;
//   }
// }

function KeychainApp() {
  // Initialize controller before React rendering
  // if (typeof window !== "undefined") {
  //   const origin = process.env.EXPO_PUBLIC_ORIGIN || "https://x.cartridge.gg";
  //   window.controller = Controller.fromStore(origin);
  // }

  return <Text>Keychain App</Text>;

  // return <SonnerToaster position="bottom-right" />;

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
