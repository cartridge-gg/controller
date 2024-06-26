import { ControllerThemePresets } from "./types";

export const defaultPresets: ControllerThemePresets = {
  cartridge: {
    id: "cartridge",
    name: "Cartridge",
    icon: "/whitelabel/cartridge/icon.svg",
    cover: {
      light: "/whitelabel/cartridge/cover-light.png",
      dark: "/whitelabel/cartridge/cover-dark.png",
    },
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
  pixelaw: {
    id: "pixelaw",
    name: "Pixelaw",
    icon: "/whitelabel/pixelaw/icon.svg",
    cover: "/whitelabel/pixelaw/cover.png",
    colors: {
      primary: "#7C00B1",
      primaryForeground: "white",
    },
  },
  "dope-wars": {
    id: "dope-wars",
    name: "Dope Wars",
    icon: "/whitelabel/dope-wars/icon.png",
    cover: "/whitelabel/dope-wars/cover.png",
    colors: {
      primary: "#11ED83",
    },
  },
  zkastle: {
    id: "zkastle",
    name: "zKastle",
    icon: "/whitelabel/zkastle/icon.svg",
    cover: "/whitelabel/zkastle/cover.png",
    colors: {
      primary: "#E50D2C",
    },
  },
  "loot-survivor": {
    id: "loot-survivor",
    name: "Loot Survivor",
    icon: "/whitelabel/loot-survivor/icon.png",
    cover: "/whitelabel/loot-survivor/cover.png",
    colors: {
      primary: "#33FF33",
    },
  },
};
