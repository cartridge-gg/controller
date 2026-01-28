"use client";

import { useMemo, useState } from "react";
import { ResponseCodes, toast } from "@cartridge/controller";
import { useAccount } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui";
import {
  STRK_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
} from "./providers/StarknetProvider";

export function Profile() {
  const { account, connector } = useAccount();
  const ctrlConnector = connector as unknown as ControllerConnector;
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapUrl = useMemo(() => {
    if (!locationCoords) {
      return null;
    }
    const { latitude, longitude } = locationCoords;
    const delta = 0.02;
    const left = longitude - delta;
    const right = longitude + delta;
    const top = latitude + delta;
    const bottom = latitude - delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }, [locationCoords]);

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
        itemName: "Cool NFT #123",
        itemImage: "https://picsum.photos/seed/adventurer/200/200",
      });
    }, 5000);
  };

  if (!account) {
    return null;
  }

  const handleLocationBlockedDemo = async () => {
    try {
      const response = await ctrlConnector.controller.openLocationPrompt();
      if (!response) {
        return;
      }

      if (response.code !== ResponseCodes.SUCCESS || !("location" in response)) {
        toast({
          variant: "error",
          message: response.message || "Location verification canceled",
        });
        return;
      }

      setLocationCoords({
        latitude: response.location.latitude,
        longitude: response.location.longitude,
      });
      toast({
        variant: "transaction",
        status: "confirmed",
        isExpanded: true,
      });
    } catch (error) {
      console.error("Location prompt failed:", error);
      toast({
        variant: "error",
        message: "Unable to verify location",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Open Starterpack</h2>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          <Button onClick={() => ctrlConnector.controller.openStarterPack(0)}>
            Nums
          </Button>
        </div>
      </div>

      <h2>Toast Demo</h2>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          <Button onClick={handleToastDemo}>Run demo</Button>
        </div>
      </div>

      <h2>Location Prompt (Blocked Demo)</h2>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          <Button onClick={handleLocationBlockedDemo}>Verify Location</Button>
        </div>
        {locationCoords && (
          <div className="flex flex-col gap-2 text-sm text-foreground-300">
            <div>
              Location received: lat {locationCoords.latitude.toFixed(5)}, lon{" "}
              {locationCoords.longitude.toFixed(5)}
            </div>
            {mapUrl && (
              <div className="overflow-hidden rounded-xl border border-foreground-700">
                <iframe
                  title="Location map"
                  src={mapUrl}
                  className="h-56 w-full"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        )}
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
                "account/bal7hazar/inventory/collection/0x046dA8955829ADF2bDa310099A0063451923f02E648cF25A1203aac6335CF0e4/token/0x000000000000000000000000000000000000000000000000000000000000c527?ps=arcade-main&preset=arcade&address=0x027917d3084dC0dcd3C4ED5189733d14b0c4C13E762829BD3D1D761aa36201AB&purchaseView=true&tokenIds=0x000000000000000000000000000000000000000000000000000000000000c527",
              )
            }
          >
            Open at Purchase
          </Button>
        </div>
      </div>
    </div>
  );
}
