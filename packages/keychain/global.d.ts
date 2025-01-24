import Controller from "./src/utils/controller";

declare global {
  interface Window {
    controller?: Controller;
  }
}

// This empty export is necessary to make this a module
export {};
