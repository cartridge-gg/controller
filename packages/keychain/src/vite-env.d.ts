/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

import { Controller } from "@/utils/controller";

declare global {
  interface Window {
    controller: Controller?;
  }
}
