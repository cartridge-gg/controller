export {
  Collection,
  CollectionAsset,
  Collectible,
  CollectibleAsset,
  CollectionListing,
  SendCollection,
  SendCollectible,
} from "./collection";
export { Token } from "./token";
export { SendToken } from "./token/send";

import { LayoutContent, Button, StarknetColorIcon } from "@cartridge/ui";
import { Collections } from "./collection";
import { Tokens } from "./token";
import { useSpecializedToast } from "@/hooks/toast";

export function Inventory() {
  const {
    handleShowAchievementToast,
    handleShowErrorToast,
    handleShowNetworkSwitchToast,
    handleShowTransactionToast,
  } = useSpecializedToast();

  return (
    <LayoutContent>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Toast Test Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                handleShowAchievementToast({
                  title: "Achievement Unlocked!",
                  subtitle: "First Steps",
                  xpAmount: 50,
                  progress: 20,
                })
              }
            >
              Show Achievement Toast
            </Button>
            <Button
              onClick={() =>
                handleShowNetworkSwitchToast({
                  networkName: "Starknet",
                  networkIcon: <StarknetColorIcon />,
                })
              }
            >
              Show Network Switch Toast
            </Button>
            <Button
              onClick={() =>
                handleShowErrorToast({
                  message:
                    "An unexpected error occurred while processing your request.",
                  progress: 100,
                })
              }
            >
              Show Error Toast
            </Button>
            <Button
              onClick={() =>
                handleShowTransactionToast({
                  label: "Transaction in Progress",
                  status: "confirming",
                  isExpanded: true,
                  progress: 60,
                })
              }
            >
              Show Transaction Toast
            </Button>
          </div>
        </div>
        <Tokens />
        <Collections />
      </div>
    </LayoutContent>
  );
}
