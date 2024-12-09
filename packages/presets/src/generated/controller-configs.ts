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
    origin: "dopewars.game",
    policies: {
      contracts: {
        "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F": {
          name: "VRF Provider",
          description: "Provides verifiable random functions",
          methods: [
            {
              name: "Request Random",
              description: "Request a random number",
              entrypoint: "request_random",
            },
          ],
        },
        "0x0410466536b5ae074f7fea81e5533b8134a9fa08b3dd077dd9db08f64997d113": {
          name: "Paper Token",
          description: "Manages paper approvals",
          methods: [
            {
              name: "Approve",
              description: "Approve paper usage",
              entrypoint: "approve",
            },
          ],
        },
        "0x044a23BbfE03FFe90D3C23Fb6e5A8AD0341036C039363DfA6F3513278Aa51fCA": {
          name: "Game Contract",
          description: "Core game mechanics",
          methods: [
            {
              name: "Create Game",
              description: "Start a new game",
              entrypoint: "create_game",
            },
            {
              name: "Travel",
              description: "Travel to a new location",
              entrypoint: "travel",
            },
            {
              name: "Decide",
              description: "Make a game decision",
              entrypoint: "decide",
            },
            {
              name: "End Game",
              description: "End the current game",
              entrypoint: "end_game",
            },
          ],
        },
        "0x0412445e644070C69fEa16b964cC81Cd6dEBF6A4DBf683E2E9686a45ad088de8": {
          name: "Laundromat Contract",
          description: "Manages game scoring and laundering",
          methods: [
            {
              name: "Register Score",
              description: "Register a game score",
              entrypoint: "register_score",
            },
            {
              name: "Claim",
              description: "Claim rewards",
              entrypoint: "claim",
            },
            {
              name: "Launder",
              description: "Launder resources",
              entrypoint: "launder",
            },
          ],
        },
      },
    },
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
    origin: "eternum.realms.world",
    policies: {
      contracts: {
        "0x047d88C65A627b38d728a783382Af648D79AED80Bf396047F9E839e8501d7F6D": {
          name: "Pillage",
          description: "Allows you raid a structure and pillage resources",
          methods: [
            {
              name: "Battle Pillage",
              description: "Pillage a structure",
              entrypoint: "battle_pillage",
            },
          ],
        },
        "0x001cE27792b23cE379398F5468b69739e89314b2657Cfa3A9c388BDFD33DcFbf": {
          name: "Battle contract",
          description: "Required to engage in battles",
          methods: [
            {
              name: "Battle Start",
              description: "Start a battle",
              entrypoint: "battle_start",
            },
            {
              name: "Battle Force Start",
              description: "Force start a battle",
              entrypoint: "battle_force_start",
            },
            {
              name: "Battle Join",
              description: "Join a battle",
              entrypoint: "battle_join",
            },
            {
              name: "Battle Leave",
              description: "Leave a battle",
              entrypoint: "battle_leave",
            },
            {
              name: "Battle Claim",
              description: "Claim a structure after a battle",
              entrypoint: "battle_claim",
            },
          ],
        },
        "0x03c212B90cC4f236BE2C014e0EE0D870277b2cC313217a73D41387E255e806ED": {
          name: "Leave battle contract",
          description: "Allows armies to leave a battle",
          methods: [
            {
              name: "Leave Battle",
              description: "Leave a battle",
              entrypoint: "leave_battle",
            },
            {
              name: "Leave Battle If Ended",
              description: "Leave a battle if its ended",
              entrypoint: "leave_battle_if_ended",
            },
          ],
        },
        "0x036b82076142f07fbD8bF7B2CABF2e6B190082c0b242c6eCC5e14B2C96d1763c": {
          name: "Building contract",
          description: "Allows to manage buildings",
          methods: [
            {
              name: "Create",
              description: "Create a building",
              entrypoint: "create",
            },
            {
              name: "Pause Production",
              description: "Pause the production of a building",
              entrypoint: "pause_production",
            },
            {
              name: "Resume Production",
              description: "Resume production of a building",
              entrypoint: "resume_production",
            },
            {
              name: "Destroy a building",
              description: "Destroy a building",
              entrypoint: "destroy",
            },
          ],
        },
        "0x012A0ca4558518d6aF296b8F393a917Bb89b3e78Ba33544814B7D9138cE4816e": {
          name: "Guild contract",
          description: "Allows guild utilities",
          methods: [
            {
              name: "Create Guild",
              description: "Creates a new guild",
              entrypoint: "create_guild",
            },
            {
              name: "Join Guild",
              description: "Join an existing guild",
              entrypoint: "join_guild",
            },
            {
              name: "Whitelist Player",
              description: "Add a player to the guild's whitelist",
              entrypoint: "whitelist_player",
            },
            {
              name: "Leave Guild",
              description: "Exit the current guild",
              entrypoint: "leave_guild",
            },
            {
              name: "Transfer Guild Ownership",
              description: "Transfer ownership of the guild to another player",
              entrypoint: "transfer_guild_ownership",
            },
            {
              name: "Remove Guild Member",
              description: "Remove a member from the guild",
              entrypoint: "remove_guild_member",
            },
            {
              name: "Remove Player From Whitelist",
              description: "Remove a player from the guild's whitelist",
              entrypoint: "remove_player_from_whitelist",
            },
          ],
        },
        "0x03BA22B088a94093F781A968E3f82a88B2Ab5047e9C309C93066f00E37334dE6": {
          name: "Hyperstructure contract",
          description: "Handles the creation and management of hyperstructures",
          methods: [
            {
              name: "Create",
              description: "Create a new hyperstructure",
              entrypoint: "create",
            },
            {
              name: "Contribute To Construction",
              description:
                "Contribute resources to hyperstructure construction",
              entrypoint: "contribute_to_construction",
            },
            {
              name: "Set Co Owners",
              description: "Set additional owners for the hyperstructure",
              entrypoint: "set_co_owners",
            },
            {
              name: "End Game",
              description:
                "Terminates the current game season once you've reached enough points",
              entrypoint: "end_game",
            },
            {
              name: "Set Access",
              description:
                "Configure access permissions for contributions to the hyperstructure",
              entrypoint: "set_access",
            },
          ],
        },
        "0x07a5e4dFaBA7AcEd9ADD65913d44311D74E12F85C55503EBF903103B102847e5": {
          name: "AMM liquidity contract",
          description: "Manages liquidity for the Automated Market Maker",
          methods: [
            {
              name: "Add",
              description: "Add liquidity to the pool",
              entrypoint: "add",
            },
            {
              name: "Remove",
              description: "Remove liquidity from the pool",
              entrypoint: "remove",
            },
          ],
        },
        "0x00CC0C73458864B9e0e884DE532b7EBFbe757E7429fB2c736aBd5E129e5FB81A": {
          name: "Exploration contract",
          description: "Allows you to move to unexplored hexes on the map",
          methods: [
            {
              name: "Explore",
              description: "Explore an uncharted hex on the game map",
              entrypoint: "explore",
            },
          ],
        },
        "0x027952F3C1C681790a168E5422C21278d925CD1BDD8DAf1CdE8E63aFDfD19E20": {
          name: "Naming contract",
          description: "Manages entity naming in the game",
          methods: [
            {
              name: "Set Entity Name",
              description: "Assign a custom name to a game entity",
              entrypoint: "set_entity_name",
            },
          ],
        },
        "0x024A8AFd7523e933d37eA2c91aD629fCCde8Ce23cEFA3c324C6248Ca929e3862": {
          name: "Realms contract",
          description: "Manages realm-related actions",
          methods: [
            {
              name: "Upgrade Level",
              description: "Upgrade the level of a realm",
              entrypoint: "upgrade_level",
            },
            {
              name: "Quest Claim",
              description: "Claim rewards from completed quests",
              entrypoint: "quest_claim",
            },
          ],
        },
        "0x0161A4CF2e207359dC7Dbf912b21e9099B7729bedE2544F849F384fCb166a109": {
          name: "Resource bridge contract",
          description: "Manages bridge transfers between L2 and Eternum",
          methods: [
            {
              name: "Deposit Initial",
              description: "Initial deposit of resources for bridge transfer",
              entrypoint: "deposit_initial",
            },
            {
              name: "Deposit",
              description: "Deposit additional resources for bridge transfer",
              entrypoint: "deposit",
            },
            {
              name: "Start Withdraw",
              description: "Initiate a withdrawal process",
              entrypoint: "start_withdraw",
            },
            {
              name: "Finish Withdraw",
              description: "Finalize a withdrawal process",
              entrypoint: "finish_withdraw",
            },
          ],
        },
        "0x0763fa425503dB5D4bdfF040f6f7509E6eCd8e3F7E75450B9b28f8fc4cDD2877": {
          name: "Resource contract",
          description: "In-game resource management",
          methods: [
            {
              name: "Approve",
              description: "Approve resource transfer",
              entrypoint: "approve",
            },
            {
              name: "Send",
              description: "Send resources to another entity",
              entrypoint: "send",
            },
            {
              name: "Pickup",
              description: "Collect available resources after approval",
              entrypoint: "pickup",
            },
          ],
        },
        "0x030a4A6472FF2BcFc68d709802E5A9F31F5AC01D04fa97e37D32CE7568741262": {
          name: "AMM swap contract",
          description: "Handles token swaps in the Automated Market Maker",
          methods: [
            {
              name: "Buy",
              description: "Purchase tokens from the liquidity pool",
              entrypoint: "buy",
            },
            {
              name: "Sell",
              description: "Sell tokens to the liquidity pool",
              entrypoint: "sell",
            },
          ],
        },
        "0x0003A6bBB82F9E670c99647F3B0C4AaF1Be82Be712E1A393336B79B9DAB44cc5": {
          name: "Market contract",
          description: "Manages trading orders in the in-game market",
          methods: [
            {
              name: "Create Order",
              description: "Create a new trading order",
              entrypoint: "create_order",
            },
            {
              name: "Accept Order",
              description: "Accept a trading order",
              entrypoint: "accept_order",
            },
            {
              name: "Accept Partial Order",
              description: "Accept a partial trading order",
              entrypoint: "accept_partial_order",
            },
            {
              name: "Cancel Order",
              description: "Cancel a trading order",
              entrypoint: "cancel_order",
            },
          ],
        },
        "0x0119Bf067E05955c0F17f1d4900977fAcBDc10e046E2319FD4d1320f5cc8Be38": {
          name: "Map travel contract",
          description: "Manages player movement across the game map",
          methods: [
            {
              name: "Travel Hex",
              description: "Move to a specific hex on the map",
              entrypoint: "travel_hex",
            },
          ],
        },
        "0x046998418397972011E93D370c2f7ac06184AD7Ed9e0811C5c9f88C1feF9445F": {
          name: "Army contract",
          description: "Manages army-related actions",
          methods: [
            {
              name: "Army Create",
              description: "Create a new army",
              entrypoint: "army_create",
            },
            {
              name: "Army Delete",
              description: "Delete an existing army",
              entrypoint: "army_delete",
            },
            {
              name: "Army Buy Troops",
              description: "Buy troops for an army",
              entrypoint: "army_buy_troops",
            },
            {
              name: "Army Merge Troops",
              description: "Merge troops from multiple armies",
              entrypoint: "army_merge_troops",
            },
          ],
        },
      },
      messages: [
        {
          types: {
            StarknetDomain: [
              {
                name: "name",
                type: "shortstring",
              },
              {
                name: "version",
                type: "shortstring",
              },
              {
                name: "chainId",
                type: "shortstring",
              },
              {
                name: "revision",
                type: "shortstring",
              },
            ],
            "eternum-Message": [
              {
                name: "identity",
                type: "ContractAddress",
              },
              {
                name: "channel",
                type: "shortstring",
              },
              {
                name: "content",
                type: "string",
              },
              {
                name: "timestamp",
                type: "felt",
              },
              {
                name: "salt",
                type: "felt",
              },
            ],
          },
          primaryType: "eternum-Message",
          domain: {
            name: "Eternum",
            version: "1",
            chainId: "SN_SEPOLIA",
            revision: "1",
          },
        },
      ],
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
