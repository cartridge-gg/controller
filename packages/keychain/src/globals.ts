import { Buffer } from "buffer";
global.Buffer = Buffer;

import Controller from "@/utils/controller";

declare global {
  interface Window {
    controller: ReturnType<typeof Controller.fromStore>;
  }
}

// Initialize controller before React rendering
window.controller = Controller.fromStore(import.meta.env.VITE_ORIGIN!);
