export * from "./types";
import { configs } from "./generated/controller-configs";

export const controllerConfigs = configs;
export const defaultTheme = configs["cartridge"].theme!;
