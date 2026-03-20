"use client";

import { toast } from "@cartridge/controller";
import { useAccount } from "@starknet-react/core";
import { mainnet } from "@starknet-react/chains";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";
import {
  STRK_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
} from "./providers/StarknetProvider";

export function Profile() {
  const { account, connector, chainId } = useAccount();
  const ctrlConnector = connector as unknown as ControllerConnector;
  const isMainnet = chainId === mainnet.id;

  const handleToastDemo = () => {
    // Demonstrate different toast variants
    toast({
      variant: "error",
      message: "Transaction failed",
    });

    setTimeout(() => {
      toast({
        variant: "transaction",
        status: "confirming",
        isExpanded: true,
      });
    }, 1000);

    setTimeout(() => {
      toast({
        variant: "network-switch",
        networkName: "Starknet Mainnet",
        networkIcon:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
      });
    }, 2000);

    setTimeout(() => {
      toast({
        variant: "achievement",
        title: "First Achievement!",
        subtitle: "Earned!",
        xpAmount: 50,
        progress: 100,
        isDraft: true,
      });
    }, 3000);

    setTimeout(() => {
      toast({
        variant: "quest",
        title: "First Quest!",
        subtitle: "Claimed!",
      });
    }, 4000);

    setTimeout(() => {
      toast({
        variant: "marketplace",
        action: "purchased",
        itemNames: ["Cool NFT #123"],
        itemImages: ["https://picsum.photos/seed/adventurer/200/200"],
        collectionName: "Cool Collection",
      });
    }, 5000);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2>Open Starterpack</h2>
      <div className="flex flex-wrap gap-1">
        <Button
          onClick={() =>
            ctrlConnector.controller.openStarterPack(0, {
              onPurchaseComplete: () => {
                console.log("Starterpack play callback fired.");
              },
            })
          }
        >
          Nums
        </Button>
        <Button
          onClick={() =>
            ctrlConnector.controller.username()?.then((username) => {
              ctrlConnector.controller.openStarterPack(isMainnet ? 1 : 16, {
                onPurchaseComplete: () => {
                  console.log("Starterpack play callback fired.");
                },
                socialClaimOptions: {
                  shareMessage: `Check out @numsgg!\nhttps://sepolia.nums.gg/?ref=${username}`,
                },
              });
            })
          }
        >
          Social Claim
        </Button>
      </div>

      <h2>Toast Demo</h2>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          <Button onClick={handleToastDemo}>Run demo</Button>
        </div>
      </div>

      <h2>Open Profile</h2>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() => ctrlConnector.controller.openProfile("inventory")}
          >
            Inventory
          </Button>
          <Button
            onClick={() => ctrlConnector.controller.openProfile("achievements")}
          >
            Achievements
          </Button>
          <Button
            onClick={() => ctrlConnector.controller.openProfile("leaderboard")}
          >
            Leaderboard
          </Button>
          <Button
            onClick={() => ctrlConnector.controller.openProfile("activity")}
          >
            Activity
          </Button>
          <Button
            onClick={() => ctrlConnector.controller.openProfileTo("followers")}
          >
            Followers
          </Button>
          <Button
            onClick={() => ctrlConnector.controller.openProfileTo("following")}
          >
            Following
          </Button>
          <Button
            onClick={() => ctrlConnector.controller.openProfileAt("/funding")}
          >
            Funding
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileTo(
                `inventory/token/${STRK_CONTRACT_ADDRESS}?preset=cartridge`,
              )
            }
          >
            Open to Token STRK
          </Button>
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileTo(
                `inventory/token/${ETH_CONTRACT_ADDRESS}?preset=cartridge`,
              )
            }
          >
            Open to Token ETH
          </Button>
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileTo(
                `inventory/token/${STRK_CONTRACT_ADDRESS}/send?preset=cartridge`,
              )
            }
          >
            Open to Token STRK Send
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileAt(
                // "account/bal7hazar/inventory/collection/0x046dA8955829ADF2bDa310099A0063451923f02E648cF25A1203aac6335CF0e4/token/0x000000000000000000000000000000000000000000000000000000000000c527?ps=arcade-main&preset=loot-survivor&address=0x027917d3084dC0dcd3C4ED5189733d14b0c4C13E762829BD3D1D761aa36201AB&purchaseView=true&tokenIds=0x000000000000000000000000000000000000000000000000000000000000c527",
                // "account/mataleone/inventory/collection/0x046dA8955829ADF2bDa310099A0063451923f02E648cF25A1203aac6335CF0e4/purchase?ps=arcade-main&preset=loot-survivor&orders=2674",
                "account/mataleone/inventory/collection/0x046dA8955829ADF2bDa310099A0063451923f02E648cF25A1203aac6335CF0e4/purchase?ps=arcade-main&preset=loot-survivor&orders=8772",
              )
            }
          >
            Purchase 1
          </Button>
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileAt(
                "account/mataleone/inventory/collection/0x07aAa9866750A0db82a54bA8674c38620Fa2F967D2FBb31133DEF48E0527c87f/purchase?ps=arcade-main&preset=pistols&orders=2474",
              )
            }
          >
            Purchase 2
          </Button>
          <Button
            onClick={() =>
              ctrlConnector.controller.openProfileAt(
                "account/mataleone/inventory/collection/0x0107AEfe535adaD25D91F77744BB37eca24D997e8216517736f06BBaEA22d214/purchase?ps=arcade-main&preset=arcade&orders=8832",
              )
            }
          >
            Purchase erc1155
          </Button>
          <Button
            onClick={() => {
              ctrlConnector.controller.openProfile("inventory");
              setTimeout(() => {
                ctrlConnector.controller.close();
              }, 3000);
            }}
          >
            Close after 3 seconds...
          </Button>
        </div>
      </div>
    </div>
  );
}
