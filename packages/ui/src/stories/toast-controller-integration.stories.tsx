import { useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/primitives/button";
import {
  ErrorToastOptions,
  SuccessToastOptions,
  TransactionToastOptions,
  MarketplaceToastOptions,
  AchievementToastOptions,
  // QuestToastOptions,
  ToastOptions,
  CONTROLLER_TOAST_MESSAGE_TYPE,
  ToastPosition,
  NetworkSwitchToastOptions,
} from "@/components/primitives/toast/types";
import { ControllerToaster } from "@/components/primitives/toast/controller-toaster";
import { toast as sonnerToast } from "sonner";
import {
  ControllerNotificationTypes,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "..";

const meta: Meta = {
  title: "Primitives/Toast/Controller Integration",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default meta;

type Story = StoryObj;

function ControllerToasterDemo() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [collapseTransactions, setCollapseTransactions] = useState(false);
  const [disabledTypes, setDisabledTypes] = useState<
    ControllerNotificationTypes[]
  >([]);
  const [position, setPosition] = useState<ToastPosition>("bottom-right");
  const [txCount, setTxCount] = useState(1);
  const [txConfirming, setTxConfirming] = useState(false);

  // Debounced toast function to prevent multiple rapid clicks
  const showToastWithDebounce = useCallback(
    (key: string, toastFn: () => void) => {
      if (isLoading[key]) return;

      setIsLoading((prev) => ({ ...prev, [key]: true }));
      toastFn();

      setTimeout(() => {
        setIsLoading((prev) => ({ ...prev, [key]: false }));
      }, 100);
    },
    [isLoading],
  );

  const emitControllerToast = (key: string, options: ToastOptions) => {
    showToastWithDebounce(key, () => {
      window.postMessage(
        {
          type: CONTROLLER_TOAST_MESSAGE_TYPE,
          options,
        },
        "*",
      );
    });
  };

  const showError = () => {
    const options: ErrorToastOptions = {
      variant: "error",
      message: "Failed to purchase asset!",
      duration: 5000,
    };
    emitControllerToast("error", options);
  };

  const showSuccess = () => {
    const options: SuccessToastOptions = {
      variant: "success",
      message: "Address copied",
      duration: 5000,
    };
    emitControllerToast("success", options);
  };

  const showSuccessLonger = () => {
    const options: SuccessToastOptions = {
      variant: "success",
      message: "You did something that really remarkable and profound!",
      duration: 5000,
    };
    emitControllerToast("successLonger", options);
  };

  const showTransactionConfirming = () => {
    const options: TransactionToastOptions = {
      variant: "transaction",
      status: "confirming",
      toastId: `tx-${txCount}`,
      label: "Purchase",
      progress: 50,
      duration: 5000,
      safeToClose: false,
    };
    emitControllerToast("transactionConfirming", options);
    setTxConfirming(true);
  };

  const showTransactionConfirmed = () => {
    const options: TransactionToastOptions = {
      variant: "transaction",
      status: "confirmed",
      toastId: `tx-${txCount}`,
      progress: 50,
      duration: 5000,
    };
    emitControllerToast("transactionConfirmed", options);
    setTxConfirming(false);
    setTxCount((prev) => prev + 1);
  };

  const showTransactionError = () => {
    const options: ErrorToastOptions = {
      variant: "error",
      message: "Transaction execution failed",
      toastId: `tx-${txCount}`,
      duration: 5000,
    };
    emitControllerToast("transactionError", options);
    setTxConfirming(false);
    setTxCount((prev) => prev + 1);
  };

  const showSwitchToStarknet = () => {
    const options: NetworkSwitchToastOptions = {
      variant: "network-switch",
      networkName: "Starknet Mainnet",
      // networkIcon: "",
      duration: 5000,
    };
    emitControllerToast("switchToStarknet", options);
  };

  const showSwitchToNums = () => {
    const options: NetworkSwitchToastOptions = {
      variant: "network-switch",
      networkName: "Nums Chain",
      networkIcon: "https://static.cartridge.gg/presets/nums/icon.png",
      duration: 5000,
    };
    emitControllerToast("switchToNums", options);
  };

  const showMarketplacePurchaseBeast = () => {
    const options: MarketplaceToastOptions = {
      variant: "marketplace",
      action: "purchased",
      collectionName: "Beasts",
      itemNames: [`Beast #${Math.floor(Math.random() * 93225) + 1}`],
      itemImages: [
        "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
      ],
      preset: "loot-survivor",
      duration: 10000,
    };
    emitControllerToast("purchaseBeast", options);
  };

  const showMarketplacePurchaseDuelists = () => {
    const options: MarketplaceToastOptions = {
      variant: "marketplace",
      action: "purchased",
      collectionName: "Pistols at Dawn Duelists",
      itemNames: ["Duelist #111", "Duelist #222", "Duelist #333"],
      itemImages: [
        "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
        "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x7aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
        "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x7aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
      ],
      preset: "pistols",
      duration: 10000,
    };
    emitControllerToast("PurchaseDuelists", options);
  };

  const showMarketplaceSentToken = () => {
    const options: MarketplaceToastOptions = {
      variant: "marketplace",
      action: "sent",
      collectionName: "LORDS",
      itemNames: ["500 LORDS"],
      itemImages: [
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
      ],
    };
    emitControllerToast("sentToken", options);
  };

  const showAchievementDraftToast = () => {
    const options: AchievementToastOptions = {
      variant: "achievement",
      title: "Pacifist Path",
      subtitle: "Earned!",
      xpAmount: 50,
      isDraft: true,
      progress: 50,
      duration: 5000,
      iconUrl: "",
    };
    emitControllerToast("achievementDraft", options);
  };

  const showAchievementToast = () => {
    const options: AchievementToastOptions = {
      variant: "achievement",
      title: "Pacifist Path",
      subtitle: "Earned!",
      xpAmount: 100,
      progress: 100,
      duration: 5000,
      iconUrl: "",
    };
    emitControllerToast("achievement", options);
  };

  // const showAchievementCustomToast = () => {
  //   const options: AchievementToastOptions = {
  //     variant: "achievement",
  //     title: "Pacifist Path",
  //     subtitle: "Earned!",
  //     iconUrl: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
  //     xpAmount: 100,
  //     progress: 100,
  //     duration: 5000,
  //   };
  //   emitControllerToast("achievementCustom", options);
  // };

  // const showQuestToast = () => {
  //   const options: QuestToastOptions = {
  //     variant: "quest",
  //     title: "Daily Quest",
  //     subtitle: "Conquered!",
  //     duration: 5000,
  //   };
  //   emitControllerToast("quest", options);
  // };

  const switchDisabledType = (type: ControllerNotificationTypes) => {
    setDisabledTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-white text-lg font-semibold mb-4">
        Controller Toast Integration
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium">
            Generic Controller events
          </h3>
          <Button
            onClick={showError}
            className="w-full"
            disabled={isLoading.error}
          >
            {isLoading.error ? "Loading..." : "Error"}
          </Button>
          <Button
            onClick={showSuccess}
            className="w-full"
            disabled={isLoading.success}
          >
            {isLoading.success ? "Loading..." : "Success"}
          </Button>
          <Button
            onClick={showSuccessLonger}
            className="w-full"
            disabled={isLoading.successLonger}
          >
            {isLoading.successLonger ? "Loading..." : "Success (long message)"}
          </Button>
          <Button
            onClick={showTransactionConfirming}
            className="w-full"
            disabled={isLoading.transactionConfirming || txConfirming}
          >
            {isLoading.transactionConfirming
              ? "Loading..."
              : `Confirm TX${txCount}...`}
          </Button>
          <Button
            onClick={showTransactionConfirmed}
            className="w-full"
            disabled={isLoading.transactionConfirmed || !txConfirming}
          >
            {isLoading.transactionConfirmed
              ? "Loading..."
              : `...TX${txCount} confirmed`}
          </Button>
          <Button
            onClick={showTransactionError}
            className="w-full"
            disabled={isLoading.transactionError || !txConfirming}
          >
            {isLoading.transactionError
              ? "Loading..."
              : `...TX${txCount} error`}
          </Button>
          <Button
            onClick={showSwitchToStarknet}
            className="w-full"
            disabled={isLoading.switchToStarknet}
          >
            {isLoading.switchToStarknet ? "Loading..." : "Switch to Starknet"}
          </Button>
          <Button
            onClick={showSwitchToNums}
            className="w-full"
            disabled={isLoading.switchToNums}
          >
            {isLoading.switchToNums ? "Loading..." : "Switch to Nums"}
          </Button>
          <Button
            onClick={() =>
              sonnerToast.success("sonner.success()", { duration: 5000 })
            }
            className="w-full"
          >
            sonner.success()
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium">Specialized events</h3>
          <Button
            onClick={showMarketplacePurchaseBeast}
            className="w-full"
            disabled={isLoading.purchaseBeast}
          >
            {isLoading.purchaseBeast
              ? "Loading..."
              : "Marketplace Purchase Beast"}
          </Button>
          <Button
            onClick={showMarketplacePurchaseDuelists}
            className="w-full"
            disabled={isLoading.PurchaseDuelists}
          >
            {isLoading.PurchaseDuelists
              ? "Loading..."
              : "Marketplace Purchase Duelists"}
          </Button>
          <Button
            onClick={showMarketplaceSentToken}
            className="w-full"
            disabled={isLoading.sentToken}
          >
            {isLoading.sentToken ? "Loading..." : "Marketplace Sent Token"}
          </Button>
          <Button
            onClick={showAchievementDraftToast}
            className="w-full"
            disabled={isLoading.achievementDraft}
          >
            {isLoading.achievementDraft ? "Loading..." : "Achievement Draft"}
          </Button>
          <Button
            onClick={showAchievementToast}
            className="w-full"
            disabled={isLoading.achievement}
          >
            {isLoading.achievement ? "Loading..." : "Achievement Complete"}
          </Button>
          {/* <Button
            onClick={showAchievementCustomToast}
            className="w-full"
            disabled={isLoading.achievementCustom}
          >
            {isLoading.achievementCustom ? "Loading..." : "Achievement Custom"}
          </Button> */}
          {/* <Button
            onClick={showQuestToast}
            className="w-full"
            disabled={isLoading.quest}
          >
            {isLoading.quest ? "Loading..." : "Quest"}
          </Button> */}
        </div>

        <div>
          <h3 className="text-white text-sm font-medium">Client Options</h3>
          <div className="py-2">
            <Select
              value={position}
              onValueChange={(value) => setPosition(value as ToastPosition)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("error") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("error")}
            />
            Disable Error
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("success") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("success")}
            />
            Disable Success
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("network-switch") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("network-switch")}
            />
            Disable Network Switch
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("transaction") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("transaction")}
            />
            Disable Transaction
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("marketplace") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("marketplace")}
            />
            Disable Marketplace
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("achievement") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("achievement")}
            />
            Disable Achievement
          </div>
          <div className="flex gap-2 pt-2">
            <Switch
              value={collapseTransactions ? 1 : 0}
              onCheckedChange={(value) => setCollapseTransactions(value)}
            />
            Collapse Transactions
          </div>
        </div>
      </div>

      <ControllerToaster
        collapseTransactions={collapseTransactions}
        disabledTypes={disabledTypes}
        position={position}
      />
      {/* <ControllerToaster toasterId="controller" position="bottom-left" /> */}
    </div>
  );
}

export const IntegrationDemo: Story = {
  render: () => <ControllerToasterDemo />,
};

export const UsageExample: Story = {
  render: () => (
    <div className="space-y-4 text-white">
      <h2 className="text-lg font-semibold">
        Integrate Controller Toasts in your app:
      </h2>

      <div className="space-y-3 text-sm">
        <div>
          <h3 className="font-medium text-green-400">
            1. Add the {"<ControllerToaster />"} component to your game: 2. If
            you already have a sonner toaster, remove its {"<Toaster />"}{" "}
            component: 3. Or, if you want the controller toasters to be
            independent from your existing sonner toaster, give it a toasterId:{" "}
            {'<ControllerToaster toasterId="controller" />'}
          </h3>
          <pre className="bg-gray-800 p-2 rounded mt-1 text-xs">
            {`import { ControllerToaster } from "@cartridge/ui";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ControllerToaster />
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  ),
};
