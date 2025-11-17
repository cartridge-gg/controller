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

import { LayoutContent, Button } from "@cartridge/ui";
import { Collections } from "./collection";
import { Tokens } from "./token";
import { useConnection } from "@/hooks/connection";
import {
  showAchievementToast,
  showNetworkSwitchToast,
  showErrorToast,
  showTransactionToast,
} from "@cartridge/ui";
import { useToast } from "@cartridge/ui";

export function Inventory() {
  const { parent } = useConnection();
  const { toast } = useToast();

  const handleShowAchievementToast = async () => {
    if (parent) {
      await parent.showToast({
        type: "achievement",
        title: "Quest Complete",
        subtitle: "Earned!",
        xpAmount: 150,
        progress: 100,
        isDraft: false,
        duration: 4000,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showAchievementToast({
          title: "Quest Complete",
          subtitle: "Earned!",
          xpAmount: 150,
          progress: 100,
          isDraft: false,
          duration: 4000,
        }),
      );
    }
  };

  const handleShowNetworkSwitchToast = async () => {
    if (parent) {
      await parent.showToast({
        type: "networkSwitch",
        networkName: "Ethereum Mainnet",
        duration: 5000,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showNetworkSwitchToast({
          networkName: "Ethereum Mainnet",
          duration: 5000,
        }),
      );
    }
  };

  const handleShowErrorToast = async () => {
    if (parent) {
      await parent.showToast({
        type: "error",
        message: "Transaction Failed: Insufficient funds",
        duration: 5000,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showErrorToast({
          message: "Transaction Failed: Insufficient funds",
          duration: 5000,
        }),
      );
    }
  };

  const handleShowTransactionToast = async () => {
    if (parent) {
      await parent.showToast({
        type: "transaction",
        label: "Transaction Submitted",
        status: "confirming",
        duration: 5000,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showTransactionToast({
          label: "Transaction Submitted",
          status: "confirming",
          duration: 5000,
        }),
      );
    }
  };

  return (
    <LayoutContent>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Toast Test Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleShowAchievementToast}>
              Show Achievement Toast
            </Button>
            <Button onClick={handleShowNetworkSwitchToast}>
              Show Network Switch Toast
            </Button>
            <Button onClick={handleShowErrorToast}>Show Error Toast</Button>
            <Button onClick={handleShowTransactionToast}>
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
