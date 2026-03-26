import type { Controller, ControllerOptions } from "./types";

interface CartridgeInit {
  options: ControllerOptions;
  resolve: (controller: Controller) => void;
  reject: (error: Error) => void;
}

declare global {
  interface Window {
    __cartridge_pending_inits?: string[];
    __cartridge_sdk_loaded?: boolean;
    __cartridge_ControllerProvider?: new (
      options?: ControllerOptions,
    ) => Controller;
    [key: `__cartridge_init_${string}`]: CartridgeInit | undefined;
  }
}
