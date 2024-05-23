import { ControllerThemePreset } from "./types";

const cartridge: ControllerThemePreset = {
  id: "cartridge",
  name: "Cartridge",
  icon: "/whitelabel/cartridge/icon.svg",
  cover: "/whitelabel/cartridge/cover.png",
};

const rollyourown: ControllerThemePreset = {
  id: "rollyourown",
  name: "Roll Your Own",
  icon: "/whitelabel/ryo/icon.png",
  cover: "/whitelabel/ryo/cover.png",
  colors: {
    primary: "#11ED83",
  },
};

export const defaultPresets = {
  cartridge,
  rollyourown,
} as const;
