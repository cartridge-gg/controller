import { Controller } from "@/utils/controller";
import { CartridgeAccount } from "@cartridge/controller-wasm/controller";

declare global {
  interface Window {
    controller?: Controller;
    CartridgeAccount: CartridgeAccount;
  }
}

// This empty export is necessary to make this a module
export {};
