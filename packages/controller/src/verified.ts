import { VerifiedConfigs } from "./types";

export const verifiedConfigs: VerifiedConfigs = {
  "force-prime": {
    origin: "",
    theme: {
      name: "Force Prime",
      icon: "/whitelabel/force-prime/icon.png",
      cover: "/whitelabel/force-prime/cover.png",
      colors: {
        primary: "#E1CC89",
      },
    },
  },
  paved: {
    origin: "",
    theme: {
      name: "Paved",
      icon: "/whitelabel/paved/icon.svg",
      cover: "/whitelabel/paved/cover.png",
      colors: {
        primary: "#B0CAF8",
      },
    },
  },
  eternum: {
    origin: "",
    theme: {
      name: "Eternum",
      icon: "/whitelabel/eternum/icon.gif",
      cover: "/whitelabel/eternum/cover.png",
      colors: {
        primary: "#CE9822",
      },
    },
  },
  pistols: {
    origin: "",
    theme: {
      name: "Pistols at Ten Blocks",
      icon: "/whitelabel/pistols/icon.png",
      cover: "/whitelabel/pistols/cover.png",
      colors: {
        primary: "#EF9758",
      },
    },
  },
  pixelaw: {
    origin: "",
    theme: {
      name: "Pixelaw",
      icon: "/whitelabel/pixelaw/icon.svg",
      cover: "/whitelabel/pixelaw/cover.png",
      colors: {
        primary: "#7C00B1",
        primaryForeground: "white",
      },
    },
  },
  "dope-wars": {
    origin: "",
    theme: {
      name: "Dope Wars",
      icon: "/whitelabel/dope-wars/icon.png",
      cover: "/whitelabel/dope-wars/cover.png",
      colors: {
        primary: "#11ED83",
      },
    },
  },
  zkastle: {
    origin: "",
    theme: {
      name: "zKastle",
      icon: "/whitelabel/zkastle/icon.svg",
      cover: "/whitelabel/zkastle/cover.png",
      colors: {
        primary: "#E50D2C",
      },
    },
  },
  "loot-survivor": {
    origin: "https://lootsurvivor.io",
    policies: {
      contracts: {
        "0x0305f26ad19e0a10715d9f3137573d3a543de7b707967cd85d11234d6ec0fb7e": {
          methods: [
            { name: "new_game" },
            { name: "explore" },
            { name: "attack" },
            { name: "flee" },
            { name: "equip" },
            { name: "drop" },
            { name: "upgrade" },
            { name: "transfer_from" },
          ],
        },
        "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49": {
          methods: [{ name: "approve" }, { name: "mint_lords" }],
        },
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
          methods: { name: "approve" },
        },
      },
    },
    theme: {
      name: "Loot Survivor",
      icon: "/whitelabel/loot-survivor/icon.png",
      cover: "/whitelabel/loot-survivor/cover.png",
      colors: {
        primary: "#33FF33",
      },
    },
  },
  zktt: {
    origin: "",
    theme: {
      name: "zKTT",
      icon: "/whitelabel/zktt/icon.png",
      cover: "/whitelabel/zktt/cover.png",
      colors: {
        primary: "#FFFFFF",
      },
    },
  },
  "tale-weaver": {
    origin: "",
    theme: {
      name: "Tale Weaver",
      icon: "/whitelabel/tale-weaver/icon.png",
      cover: "/whitelabel/tale-weaver/cover.png",
      colors: {
        primary: "#fce377",
      },
    },
  },
  "realm-of-ra": {
    origin: "",
    theme: {
      name: "Realm of Ra",
      icon: "/whitelabel/realm-of-ra/icon.png",
      cover: "/whitelabel/realm-of-ra/cover.png",
      colors: {
        primary: "#de9534",
      },
    },
  },
  "jokers-of-neon": {
    origin: "",
    theme: {
      name: "Jokers of Neon",
      icon: "/whitelabel/jokers-of-neon/icon.png",
      cover: "/whitelabel/jokers-of-neon/cover.png",
      colors: {
        primary: "#A144B2",
      },
    },
  },
  flippyflop: {
    origin: "",
    theme: {
      name: "FlippyFlop",
      icon: "/whitelabel/flippyflop/icon.png",
      cover: "/whitelabel/flippyflop/cover.png",
      colors: {
        primary: "#F38332",
      },
    },
  },
  "savage-summit": {
    origin: "",
    theme: {
      name: "Savage Summit",
      icon: "/whitelabel/savage-summit/icon.png",
      cover: "/whitelabel/savage-summit/cover.png",
      colors: {
        primary: "#fbf7da",
      },
    },
  },
  "dark-shuffle": {
    origin: "",
    theme: {
      name: "Dark Shuffle",
      icon: "/whitelabel/dark-shuffle/icon.svg",
      cover: "/whitelabel/dark-shuffle/cover.png",
      colors: {
        primary: "#F59100",
      },
    },
  },
  "blob-arena": {
    origin: "",
    theme: {
      name: "Blob Arena",
      icon: "/whitelabel/blob-arena/icon.png",
      cover: "/whitelabel/blob-arena/cover.png",
      colors: {
        primary: "#980f06",
      },
    },
  },
  zkube: {
    origin: "",
    theme: {
      name: "zKube",
      icon: "/whitelabel/zkube/icon.png",
      cover: "/whitelabel/zkube/cover.png",
      colors: {
        primary: "#5bc3e6",
      },
    },
  },
};
