// This file is auto-generated. DO NOT EDIT IT MANUALLY.
import { ControllerConfigs } from "../";

export const configs: ControllerConfigs = {
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
  cartridge: {
    origin: "*",
    theme: {
      name: "Cartridge",
      icon: "/whitelabel/cartridge/icon.svg",
      cover: {
        light: "/whitelabel/cartridge/cover-light.png",
        dark: "/whitelabel/cartridge/cover-dark.png",
      },
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
    policies: {
      contracts: {
        "0x037d6041960174159E2588f0ee52b3e732b2d3A48528124c046e30180abB84fA": {
          methods: [
            {
              name: "Create Bank",
              description: "",
              entrypoint: "create_bank",
            },
            {
              name: "Change Owner Amm Fee",
              description: "",
              entrypoint: "change_owner_amm_fee",
            },
            {
              name: "Change Owner Bridge Fee",
              description: "",
              entrypoint: "change_owner_bridge_fee",
            },
          ],
        },
        "0x047d88C65A627b38d728a783382Af648D79AED80Bf396047F9E839e8501d7F6D": {
          methods: [
            {
              name: "Battle Pillage",
              description: "",
              entrypoint: "battle_pillage",
            },
          ],
        },
        "0x001cE27792b23cE379398F5468b69739e89314b2657Cfa3A9c388BDFD33DcFbf": {
          methods: [
            {
              name: "Battle Start",
              description: "",
              entrypoint: "battle_start",
            },
            {
              name: "Battle Force Start",
              description: "",
              entrypoint: "battle_force_start",
            },
            {
              name: "Battle Join",
              description: "",
              entrypoint: "battle_join",
            },
            {
              name: "Battle Leave",
              description: "",
              entrypoint: "battle_leave",
            },
            {
              name: "Battle Claim",
              description: "",
              entrypoint: "battle_claim",
            },
          ],
        },
        "0x03c212B90cC4f236BE2C014e0EE0D870277b2cC313217a73D41387E255e806ED": {
          methods: [
            {
              name: "Leave Battle",
              description: "",
              entrypoint: "leave_battle",
            },
            {
              name: "Leave Battle If Ended",
              description: "",
              entrypoint: "leave_battle_if_ended",
            },
          ],
        },
        "0x036b82076142f07fbD8bF7B2CABF2e6B190082c0b242c6eCC5e14B2C96d1763c": {
          methods: [
            {
              name: "Create",
              description: "",
              entrypoint: "create",
            },
            {
              name: "Pause Production",
              description: "",
              entrypoint: "pause_production",
            },
            {
              name: "Resume Production",
              description: "",
              entrypoint: "resume_production",
            },
            {
              name: "Destroy",
              description: "",
              entrypoint: "destroy",
            },
          ],
        },
        "0x06fB53696e3d361e88979b9A48bC9925971cBa735cF13275A9157142B2B4C608": {
          methods: [
            {
              name: "Set World Config",
              description: "",
              entrypoint: "set_world_config",
            },
            {
              name: "Set Season Config",
              description: "",
              entrypoint: "set_season_config",
            },
            {
              name: "Set Quest Config",
              description: "",
              entrypoint: "set_quest_config",
            },
            {
              name: "Set Quest Reward Config",
              description: "",
              entrypoint: "set_quest_reward_config",
            },
            {
              name: "Set Map Config",
              description: "",
              entrypoint: "set_map_config",
            },
            {
              name: "Set Capacity Config",
              description: "",
              entrypoint: "set_capacity_config",
            },
            {
              name: "Set Travel Stamina Cost Config",
              description: "",
              entrypoint: "set_travel_stamina_cost_config",
            },
            {
              name: "Set Weight Config",
              description: "",
              entrypoint: "set_weight_config",
            },
            {
              name: "Set Battle Config",
              description: "",
              entrypoint: "set_battle_config",
            },
            {
              name: "Set Tick Config",
              description: "",
              entrypoint: "set_tick_config",
            },
            {
              name: "Set Stamina Config",
              description: "",
              entrypoint: "set_stamina_config",
            },
            {
              name: "Set Travel Food Cost Config",
              description: "",
              entrypoint: "set_travel_food_cost_config",
            },
            {
              name: "Set Stamina Refill Config",
              description: "",
              entrypoint: "set_stamina_refill_config",
            },
            {
              name: "Set Leveling Config",
              description: "",
              entrypoint: "set_leveling_config",
            },
            {
              name: "Set Production Config",
              description: "",
              entrypoint: "set_production_config",
            },
            {
              name: "Set Speed Config",
              description: "",
              entrypoint: "set_speed_config",
            },
            {
              name: "Set Hyperstructure Config",
              description: "",
              entrypoint: "set_hyperstructure_config",
            },
            {
              name: "Set Bank Config",
              description: "",
              entrypoint: "set_bank_config",
            },
            {
              name: "Set Troop Config",
              description: "",
              entrypoint: "set_troop_config",
            },
            {
              name: "Set Building Category Pop Config",
              description: "",
              entrypoint: "set_building_category_pop_config",
            },
            {
              name: "Set Population Config",
              description: "",
              entrypoint: "set_population_config",
            },
            {
              name: "Set Building General Config",
              description: "",
              entrypoint: "set_building_general_config",
            },
            {
              name: "Set Building Config",
              description: "",
              entrypoint: "set_building_config",
            },
            {
              name: "Set Mercenaries Config",
              description: "",
              entrypoint: "set_mercenaries_config",
            },
            {
              name: "Set Resource Bridge Config",
              description: "",
              entrypoint: "set_resource_bridge_config",
            },
            {
              name: "Set Resource Bridge Fee Split Config",
              description: "",
              entrypoint: "set_resource_bridge_fee_split_config",
            },
            {
              name: "Set Resource Bridge Whitelist Config",
              description: "",
              entrypoint: "set_resource_bridge_whitelist_config",
            },
            {
              name: "Set Realm Max Level Config",
              description: "",
              entrypoint: "set_realm_max_level_config",
            },
            {
              name: "Set Realm Level Config",
              description: "",
              entrypoint: "set_realm_level_config",
            },
            {
              name: "Set Settlement Config",
              description: "",
              entrypoint: "set_settlement_config",
            },
          ],
        },
        "0x0562d27d0C3dB5f34ee37F758D34A01163E933165aa9b794265e6c10d667AF20": {
          methods: [
            {
              name: "Create Admin Bank",
              description: "",
              entrypoint: "create_admin_bank",
            },
          ],
        },
        "0x005291E7F4c092A2a5975BD29e9b42Cb69cdC831214A27a675d732AD33F4af7c": {
          methods: [
            {
              name: "Create",
              description: "",
              entrypoint: "create",
            },
          ],
        },
        "0x06B768187dd4D1dD3fE45A2533C6e099C596283F7699d786e40d701334b76bD8": {
          methods: [
            {
              name: "Mint",
              description: "",
              entrypoint: "mint",
            },
          ],
        },
        "0x012A0ca4558518d6aF296b8F393a917Bb89b3e78Ba33544814B7D9138cE4816e": {
          methods: [
            {
              name: "Create Guild",
              description: "",
              entrypoint: "create_guild",
            },
            {
              name: "Join Guild",
              description: "",
              entrypoint: "join_guild",
            },
            {
              name: "Whitelist Player",
              description: "",
              entrypoint: "whitelist_player",
            },
            {
              name: "Leave Guild",
              description: "",
              entrypoint: "leave_guild",
            },
            {
              name: "Transfer Guild Ownership",
              description: "",
              entrypoint: "transfer_guild_ownership",
            },
            {
              name: "Remove Guild Member",
              description: "",
              entrypoint: "remove_guild_member",
            },
            {
              name: "Remove Player From Whitelist",
              description: "",
              entrypoint: "remove_player_from_whitelist",
            },
          ],
        },
        "0x03BA22B088a94093F781A968E3f82a88B2Ab5047e9C309C93066f00E37334dE6": {
          methods: [
            {
              name: "Create",
              description: "",
              entrypoint: "create",
            },
            {
              name: "Contribute To Construction",
              description: "",
              entrypoint: "contribute_to_construction",
            },
            {
              name: "Set Co Owners",
              description: "",
              entrypoint: "set_co_owners",
            },
            {
              name: "End Game",
              description: "",
              entrypoint: "end_game",
            },
            {
              name: "Set Access",
              description: "",
              entrypoint: "set_access",
            },
          ],
        },
        "0x07a5e4dFaBA7AcEd9ADD65913d44311D74E12F85C55503EBF903103B102847e5": {
          methods: [
            {
              name: "Add",
              description: "",
              entrypoint: "add",
            },
            {
              name: "Remove",
              description: "",
              entrypoint: "remove",
            },
          ],
        },
        "0x07e16a342A6ccC2c666805925e584B2B52967Bd1C2391B705d393c744BF239c1": {
          methods: [
            {
              name: "Discover Shards Mine",
              description: "",
              entrypoint: "discover_shards_mine",
            },
            {
              name: "Add Mercenaries To Structure",
              description: "",
              entrypoint: "add_mercenaries_to_structure",
            },
          ],
        },
        "0x00CC0C73458864B9e0e884DE532b7EBFbe757E7429fB2c736aBd5E129e5FB81A": {
          methods: [
            {
              name: "Explore",
              description: "",
              entrypoint: "explore",
            },
          ],
        },
        "0x027952F3C1C681790a168E5422C21278d925CD1BDD8DAf1CdE8E63aFDfD19E20": {
          methods: [
            {
              name: "Set Address Name",
              description: "",
              entrypoint: "set_address_name",
            },
            {
              name: "Set Entity Name",
              description: "",
              entrypoint: "set_entity_name",
            },
          ],
        },
        "0x01BD8e8Db3EEC84B21f8F55609CaD83CEA80812bF6Ff365DC67D787aF818E63E": {
          methods: [
            {
              name: "Transfer Ownership",
              description: "",
              entrypoint: "transfer_ownership",
            },
          ],
        },
        "0x024A8AFd7523e933d37eA2c91aD629fCCde8Ce23cEFA3c324C6248Ca929e3862": {
          methods: [
            {
              name: "Create",
              description: "",
              entrypoint: "create",
            },
            {
              name: "Upgrade Level",
              description: "",
              entrypoint: "upgrade_level",
            },
            {
              name: "Quest Claim",
              description: "",
              entrypoint: "quest_claim",
            },
          ],
        },
        "0x0161A4CF2e207359dC7Dbf912b21e9099B7729bedE2544F849F384fCb166a109": {
          methods: [
            {
              name: "Deposit Initial",
              description: "",
              entrypoint: "deposit_initial",
            },
            {
              name: "Deposit",
              description: "",
              entrypoint: "deposit",
            },
            {
              name: "Start Withdraw",
              description: "",
              entrypoint: "start_withdraw",
            },
            {
              name: "Finish Withdraw",
              description: "",
              entrypoint: "finish_withdraw",
            },
          ],
        },
        "0x0763fa425503dB5D4bdfF040f6f7509E6eCd8e3F7E75450B9b28f8fc4cDD2877": {
          methods: [
            {
              name: "Approve",
              description: "",
              entrypoint: "approve",
            },
            {
              name: "Send",
              description: "",
              entrypoint: "send",
            },
            {
              name: "Pickup",
              description: "",
              entrypoint: "pickup",
            },
          ],
        },
        "0x030a4A6472FF2BcFc68d709802E5A9F31F5AC01D04fa97e37D32CE7568741262": {
          methods: [
            {
              name: "Buy",
              description: "",
              entrypoint: "buy",
            },
            {
              name: "Sell",
              description: "",
              entrypoint: "sell",
            },
          ],
        },
        "0x0003A6bBB82F9E670c99647F3B0C4AaF1Be82Be712E1A393336B79B9DAB44cc5": {
          methods: [
            {
              name: "Create Order",
              description: "",
              entrypoint: "create_order",
            },
            {
              name: "Accept Order",
              description: "",
              entrypoint: "accept_order",
            },
            {
              name: "Accept Partial Order",
              description: "",
              entrypoint: "accept_partial_order",
            },
            {
              name: "Cancel Order",
              description: "",
              entrypoint: "cancel_order",
            },
          ],
        },
        "0x0119Bf067E05955c0F17f1d4900977fAcBDc10e046E2319FD4d1320f5cc8Be38": {
          methods: [
            {
              name: "Travel",
              description: "",
              entrypoint: "travel",
            },
            {
              name: "Travel Hex",
              description: "",
              entrypoint: "travel_hex",
            },
          ],
        },
        "0x046998418397972011E93D370c2f7ac06184AD7Ed9e0811C5c9f88C1feF9445F": {
          methods: [
            {
              name: "Army Create",
              description: "",
              entrypoint: "army_create",
            },
            {
              name: "Army Delete",
              description: "",
              entrypoint: "army_delete",
            },
            {
              name: "Army Buy Troops",
              description: "",
              entrypoint: "army_buy_troops",
            },
            {
              name: "Army Merge Troops",
              description: "",
              entrypoint: "army_merge_troops",
            },
          ],
        },
      },
      messages: [],
    },
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
          methods: [
            {
              entrypoint: "approve",
            },
            {
              entrypoint: "mint_lords",
            },
          ],
        },
        "0x0305f26ad19e0a10715d9f3137573d3a543de7b707967cd85d11234d6ec0fb7e": {
          methods: [
            {
              entrypoint: "attack",
            },
            {
              entrypoint: "drop",
            },
            {
              entrypoint: "equip",
            },
            {
              entrypoint: "explore",
            },
            {
              entrypoint: "flee",
            },
            {
              entrypoint: "new_game",
            },
            {
              entrypoint: "transfer_from",
            },
            {
              entrypoint: "upgrade",
            },
          ],
        },
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
          methods: [
            {
              entrypoint: "approve",
            },
          ],
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
  "realm-of-ra": {
    origin: "https://mancala.realmofra.com",
    theme: {
      colors: {
        primary: "#de9534",
      },
      cover: "/whitelabel/realm-of-ra/cover.png",
      icon: "/whitelabel/realm-of-ra/icon.png",
      name: "Realm of Ra",
    },
  },
  "savage-summit": {
    origin: "",
    theme: {
      colors: {
        primary: "#fbf7da",
      },
      cover: "/whitelabel/savage-summit/cover.png",
      icon: "/whitelabel/savage-summit/icon.png",
      name: "Savage Summit",
    },
  },
  "tale-weaver": {
    origin: "",
    theme: {
      colors: {
        primary: "#fce377",
      },
      cover: "/whitelabel/tale-weaver/cover.png",
      icon: "/whitelabel/tale-weaver/icon.png",
      name: "Tale Weaver",
    },
  },
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
