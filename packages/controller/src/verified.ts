import { VerifiedConfigs } from "./types";

export const defaultTheme = {
  name: "Cartridge",
  icon: "/whitelabel/cartridge/icon.svg",
  cover: {
    light: "/whitelabel/cartridge/cover-light.png",
    dark: "/whitelabel/cartridge/cover-dark.png",
  },
};

export const verifiedConfigs: VerifiedConfigs = {
  "blob-arena": {
    origin: "https://www.blobarena.xyz",
    theme: {
      colors: {
        primary: "#980f06",
      },
      cover: "/whitelabel/blob-arena/cover.png",
      icon: "/whitelabel/blob-arena/icon.png",
      name: "Blob Arena",
    },
  },
  "dark-shuffle": {
    origin: "https://darkshuffle.dev",
    theme: {
      colors: {
        primary: "#F59100",
      },
      cover: "/whitelabel/dark-shuffle/cover.png",
      icon: "/whitelabel/dark-shuffle/icon.svg",
      name: "Dark Shuffle",
    },
  },
  "dope-wars": {
    origin: "https://dopewars.game",
    theme: {
      colors: {
        primary: "#11ED83",
      },
      cover: "/whitelabel/dope-wars/cover.png",
      icon: "/whitelabel/dope-wars/icon.png",
      name: "Dope Wars",
    },
  },
  eternum: {
    origin: "",
    theme: {
      name: "Eternum",
      icon: "/whitelabel/eternum/icon.svg",
      cover: "/whitelabel/eternum/cover.png",
      colors: {
        primary: "#dc8b07",
      },
    },
  },
  flippyflop: {
    origin: "https://flippyflop.gg",
    theme: {
      colors: {
        primary: "#F38332",
      },
      cover: "/whitelabel/flippyflop/cover.png",
      icon: "/whitelabel/flippyflop/icon.png",
      name: "FlippyFlop",
    },
  },
  "force-prime": {
    origin: "https://forceprime.io",
    theme: {
      colors: {
        primary: "#E1CC89",
      },
      cover: "/whitelabel/force-prime/cover.png",
      icon: "/whitelabel/force-prime/icon.png",
      name: "Force Prime",
    },
  },
  "jokers-of-neon": {
    origin: "https://jokersofneon.com",
    theme: {
      colors: {
        primary: "#A144B2",
      },
      cover: "/whitelabel/jokers-of-neon/cover.png",
      icon: "/whitelabel/jokers-of-neon/icon.png",
      name: "Jokers of Neon",
    },
  },
  "loot-survivor": {
    origin: "https://lootsurvivor.io",
    policies: {
      contracts: {
        "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49": {
          methods: [{ name: "approve" }, { name: "mint_lords" }],
        },
        "0x0305f26ad19e0a10715d9f3137573d3a543de7b707967cd85d11234d6ec0fb7e": {
          methods: [
            { name: "attack" },
            { name: "drop" },
            { name: "equip" },
            { name: "explore" },
            { name: "flee" },
            { name: "new_game" },
            { name: "transfer_from" },
            { name: "upgrade" },
          ],
        },
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
          methods: { name: "approve" },
        },
      },
    },
    theme: {
      colors: {
        primary: "#33FF33",
      },
      cover: "/whitelabel/loot-survivor/cover.png",
      icon: "/whitelabel/loot-survivor/icon.png",
      name: "Loot Survivor",
    },
  },
  paved: {
    origin: "https://paved.gg",
    theme: {
      colors: {
        primary: "#B0CAF8",
      },
      cover: "/whitelabel/paved/cover.png",
      icon: "/whitelabel/paved/icon.svg",
      name: "Paved",
    },
  },
  pistols: {
    origin: "https://pistols.underware.gg",
    theme: {
      colors: {
        primary: "#EF9758",
      },
      cover: "/whitelabel/pistols/cover.png",
      icon: "/whitelabel/pistols/icon.png",
      name: "Pistols at Ten Blocks",
    },
  },
  pixelaw: {
    origin: "https://dojo.pixelaw.xyz",
    theme: {
      colors: {
        primary: "#7C00B1",
        primaryForeground: "white",
      },
      cover: "/whitelabel/pixelaw/cover.png",
      icon: "/whitelabel/pixelaw/icon.svg",
      name: "Pixelaw",
    },
  },
  // "realm-of-ra": {
  //   origin: "https://mancala.realmofra.com",
  //   theme: {
  //     colors: {
  //       primary: "#de9534",
  //     },
  //     cover: "/whitelabel/realm-of-ra/cover.png",
  //     icon: "/whitelabel/realm-of-ra/icon.png",
  //     name: "Realm of Ra",
  //   },
  // },
  // "savage-summit": {
  //   origin: "",
  //   theme: {
  //     colors: {
  //       primary: "#fbf7da",
  //     },
  //     cover: "/whitelabel/savage-summit/cover.png",
  //     icon: "/whitelabel/savage-summit/icon.png",
  //     name: "Savage Summit",
  //   },
  // },
  // "tale-weaver": {
  //   origin: "",
  //   theme: {
  //     colors: {
  //       primary: "#fce377",
  //     },
  //     cover: "/whitelabel/tale-weaver/cover.png",
  //     icon: "/whitelabel/tale-weaver/icon.png",
  //     name: "Tale Weaver",
  //   },
  // },
  zkastle: {
    origin: "https://zkastle.vercel.app",
    theme: {
      colors: {
        primary: "#E50D2C",
      },
      cover: "/whitelabel/zkastle/cover.png",
      icon: "/whitelabel/zkastle/icon.svg",
      name: "zKastle",
    },
  },
  zktt: {
    origin: "https://zktable.top",
    theme: {
      colors: {
        primary: "#FFFFFF",
      },
      cover: "/whitelabel/zktt/cover.png",
      icon: "/whitelabel/zktt/icon.png",
      name: "zKTT",
    },
  },
  zkube: {
    origin: "https://zkube.vercel.app",
    theme: {
      colors: {
        primary: "#5bc3e6",
      },
      cover: "/whitelabel/zkube/cover.png",
      icon: "/whitelabel/zkube/icon.png",
      name: "zKube",
    },
  },
};
