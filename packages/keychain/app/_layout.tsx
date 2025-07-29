import "@/index.css";
import "@/globals";

import { StrictMode } from "react";
import { SonnerToaster } from "@cartridge/ui";
import { Provider } from "@/components/provider";
import { Slot } from "expo-router";
import Controller from "@/utils/controller";

window.controller = Controller.fromStore(process.env.EXPO_PUBLIC_ORIGIN!);

export default function RootLayout() {
  return (
    <StrictMode>
      <Provider>
        <div style={{ position: "relative" }}>
          <Slot />
        </div>
        <SonnerToaster position="bottom-right" />
      </Provider>
    </StrictMode>
  );
}
