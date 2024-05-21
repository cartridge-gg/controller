import { ControllerPresetThemeName, ControllerThemePreset } from "./types";

export const presets: Record<ControllerPresetThemeName, ControllerThemePreset> =
  {
    cartridge: {
      id: "cartridge",
      name: "Cartridge",
      icon: "/whitelabel/cartridge/icon.png",
      cover: "/whitelabel/cartridge/cover.png",
    },
    rollyourown: {
      id: "rollyourown",
      name: "Roll Your Own",
      icon: "/whitelabel/ryo/icon.png",
      cover: "/whitelabel/ryo/cover.png",
      colors: {
        primary: "#11ED83",
      },
    },
  };
