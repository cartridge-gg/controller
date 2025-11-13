/// <reference types="vite/client" />

import { Controller } from "@/utils/controller";

declare global {
  interface Window {
    controller?: Controller;
  }
}
