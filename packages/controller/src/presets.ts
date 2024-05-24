import { ControllerThemePreset } from "./types";

export const defaultPresets: { [key: string]: ControllerThemePreset } = {
  cartridge: {
    id: "cartridge",
    name: "Cartridge",
    icon: "/whitelabel/cartridge/icon.svg",
    cover: "/whitelabel/cartridge/cover-dark.png",
  },
  "force-prime": {
    id: "force-prime",
    name: "Force Prime",
    icon: "/whitelabel/force-prime/icon.png",
    cover: "/whitelabel/force-prime/cover.png",
    colors: {
      primary: "#E1CC89",
    },
  },
  paved: {
    id: "paved",
    name: "Paved",
    icon: "/whitelabel/paved/icon.svg",
    cover: "/whitelabel/paved/cover.png",
    colors: {
      primary: "#B0CAF8",
    },
  },
  rollyourown: {
    id: "rollyourown",
    name: "Roll Your Own",
    icon: "/whitelabel/rollyourown/icon.png",
    cover: "/whitelabel/rollyourown/cover.png",
    colors: {
      primary: "#11ED83",
    },
  },
} as const;
