import { useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { toast as sonnerToast } from "sonner";
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
  NetworkToastOptions,
  UserToastOptions,
  SettingToastOptions,
  CreditsToastOptions,
} from "../types";
import {
  ControllerToaster,
  ControllerNotificationTypes,
  CONTROLLER_TOASTER_ID,
} from "./controller-toaster";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "../../..";
import { TOAST_SN_MAIN, TOAST_SN_SEPOLIA } from "../toasts/specialized-toasts";

const meta: Meta = {
  title: "Controller React/Toaster/Controller Toaster",
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
  const [duration, setDuration] = useState<number | undefined>(undefined);
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
    };
    emitControllerToast("error", options);
  };

  const showSuccess = () => {
    const options: SuccessToastOptions = {
      variant: "success",
      message: "Address copied",
    };
    emitControllerToast("success", options);
  };

  const showSuccessLongMessage = () => {
    const options: SuccessToastOptions = {
      variant: "success",
      message: "You did something that really remarkable and profound!",
    };
    emitControllerToast("successLongMessage", options);
  };

  const showSuccessCustomDuration = () => {
    const options: SuccessToastOptions = {
      variant: "success",
      message: "Catch me if you can!",
      duration: 500,
    };
    emitControllerToast("successCustomDuration", options);
  };

  const showTransactionConfirming = () => {
    const options: TransactionToastOptions = {
      variant: "transaction",
      status: "confirming",
      toastId: `tx-${txCount}`,
      label: "Purchase",
      progress: 50,
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
    };
    emitControllerToast("transactionError", options);
    setTxConfirming(false);
    setTxCount((prev) => prev + 1);
  };

  const showConnectToStarknetMainnet = () => {
    const options: NetworkToastOptions = {
      variant: "network",
      kind: "connect",
      chainId: TOAST_SN_MAIN,
      networkName: "Ignored",
      networkIcon: "Ignored",
    };
    emitControllerToast("connectToStarknetMainnet", options);
  };

  const showSwitchToStarknetMainnet = () => {
    const options: NetworkToastOptions = {
      variant: "network",
      kind: "switch-chain",
      chainId: TOAST_SN_MAIN,
      networkName: "Ignored",
      networkIcon: "Ignored",
    };
    emitControllerToast("switchToStarknetMainnet", options);
  };

  const showSwitchToStarknetSepolia = () => {
    const options: NetworkToastOptions = {
      variant: "network",
      kind: "switch-chain",
      chainId: TOAST_SN_SEPOLIA,
    };
    emitControllerToast("switchToStarknetSepolia", options);
  };

  const showSwitchToKatanaLocal = () => {
    const options: NetworkToastOptions = {
      variant: "network",
      kind: "switch-chain",
      chainId: "0x4B4154414E415F4C4F43414C", // "KATANA_LOCAL"
    };
    emitControllerToast("switchToKatanaLocal", options);
  };

  const showSwitchToNumsChain = () => {
    const options: NetworkToastOptions = {
      variant: "network",
      kind: "switch-chain",
      chainId: "0x1234567890",
      networkName: "Nums Chain",
      networkIcon: "https://static.cartridge.gg/presets/nums/icon.png",
    };
    emitControllerToast("switchToNumsChain", options);
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
      iconUrl: "",
    };
    emitControllerToast("achievement", options);
  };

  const showUserCreated = () => {
    const options: UserToastOptions = {
      variant: "user",
      kind: "created",
      username: "clicksave",
    };
    emitControllerToast("userCreated", options);
  };

  const showUserConnected = () => {
    const options: UserToastOptions = {
      variant: "user",
      kind: "connected",
      username: "shinobi",
    };
    emitControllerToast("userConnected", options);
  };

  const showUserDisconnected = () => {
    const options: UserToastOptions = {
      variant: "user",
      kind: "disconnected",
      username: "0xmajor",
    };
    emitControllerToast("userDisconnected", options);
  };

  const showSignerCreated = () => {
    const options: SettingToastOptions = {
      variant: "setting",
      kind: "signer",
      action: "created",
    };
    emitControllerToast("signerCreated", options);
  };

  const showSignerDeleted = () => {
    const options: SettingToastOptions = {
      variant: "setting",
      kind: "signer",
      action: "deleted",
    };
    emitControllerToast("signerDeleted", options);
  };

  const showCreditsDepositInitiated = () => {
    const options: CreditsToastOptions = {
      variant: "credits",
      kind: "deposit",
      status: "initiated",
      amount: 100,
    };
    emitControllerToast("creditsDepositInitiated", options);
  };

  const showCreditsDepositCompleted = () => {
    const options: CreditsToastOptions = {
      variant: "credits",
      kind: "deposit",
      status: "completed",
      amount: 100,
    };
    emitControllerToast("creditsDepositCompleted", options);
  };

  const showCreditsWithdrawInitiated = () => {
    const options: CreditsToastOptions = {
      variant: "credits",
      kind: "withdraw",
      status: "initiated",
      amount: 42.5,
    };
    emitControllerToast("creditsWithdrawInitiated", options);
  };

  const showCreditsWithdrawCompleted = () => {
    const options: CreditsToastOptions = {
      variant: "credits",
      kind: "withdraw",
      status: "completed",
      amount: 42.5,
    };
    emitControllerToast("creditsWithdrawCompleted", options);
  };

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
          <h3 className="text-white text-sm font-medium">Error</h3>
          <Button
            onClick={showError}
            className="w-full"
            disabled={isLoading.error}
          >
            {isLoading.error ? "Loading..." : "Error"}
          </Button>
          <h3 className="text-white text-sm font-medium">Success</h3>
          <Button
            onClick={showSuccess}
            className="w-full"
            disabled={isLoading.success}
          >
            {isLoading.success ? "Loading..." : "Success"}
          </Button>
          <Button
            onClick={showSuccessLongMessage}
            className="w-full"
            disabled={isLoading.successLongMessage}
          >
            {isLoading.successLongMessage
              ? "Loading..."
              : "Success (long message)"}
          </Button>
          <Button
            onClick={showSuccessCustomDuration}
            className="w-full"
            disabled={isLoading.successCustomDuration}
          >
            {isLoading.successCustomDuration
              ? "Loading..."
              : "Success (custom duration)"}
          </Button>
          <h3 className="text-white text-sm font-medium">Network</h3>
          <Button
            onClick={showConnectToStarknetMainnet}
            className="w-full"
            disabled={isLoading.connectToStarknetMainnet}
          >
            {isLoading.connectToStarknetMainnet
              ? "Loading..."
              : "Connect to Starknet Mainnet"}
          </Button>
          <Button
            onClick={showSwitchToStarknetMainnet}
            className="w-full"
            disabled={isLoading.switchToStarkneMainnet}
          >
            {isLoading.switchToStarkneMainnet
              ? "Loading..."
              : "Switch to Starknet Mainnet"}
          </Button>
          <Button
            onClick={showSwitchToStarknetSepolia}
            className="w-full"
            disabled={isLoading.switchToStarknetSepolia}
          >
            {isLoading.switchToStarknetSepolia
              ? "Loading..."
              : "Switch to Starknet Sepolia"}
          </Button>
          <Button
            onClick={showSwitchToKatanaLocal}
            className="w-full"
            disabled={isLoading.switchToKatanaLocal}
          >
            {isLoading.switchToKatanaLocal
              ? "Loading..."
              : "Switch to Katana Local"}
          </Button>
          <Button
            onClick={showSwitchToNumsChain}
            className="w-full"
            disabled={isLoading.switchToNumsChain}
          >
            {isLoading.switchToNumsChain
              ? "Loading..."
              : "Switch to Nums Chain"}
          </Button>
          <h3 className="text-white text-sm font-medium">Transaction</h3>
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
          <h3 className="text-white text-sm font-medium">native sonner</h3>
          <Button
            onClick={() =>
              sonnerToast.success("called sonner with controller toasterId", {
                duration: 5000,
                toasterId: CONTROLLER_TOASTER_ID,
              })
            }
            className="w-full"
          >
            sonner.success()
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium">Marketplace</h3>
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
          <h3 className="text-white text-sm font-medium">Achievement</h3>
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
          <h3 className="text-white text-sm font-medium">User</h3>
          <Button
            onClick={showUserCreated}
            className="w-full"
            disabled={isLoading.userCreated}
          >
            {isLoading.userCreated ? "Loading..." : "User Created"}
          </Button>
          <Button
            onClick={showUserConnected}
            className="w-full"
            disabled={isLoading.userConnected}
          >
            {isLoading.userConnected ? "Loading..." : "User Connected"}
          </Button>
          <Button
            onClick={showUserDisconnected}
            className="w-full"
            disabled={isLoading.userDisconnected}
          >
            {isLoading.userDisconnected ? "Loading..." : "User Disconnected"}
          </Button>
          <h3 className="text-white text-sm font-medium">Setting</h3>
          <Button
            onClick={showSignerCreated}
            className="w-full"
            disabled={isLoading.signerCreated}
          >
            {isLoading.signerCreated ? "Loading..." : "Signer Created"}
          </Button>
          <Button
            onClick={showSignerDeleted}
            className="w-full"
            disabled={isLoading.signerDeleted}
          >
            {isLoading.signerDeleted ? "Loading..." : "Signer Deleted"}
          </Button>
          <h3 className="text-white text-sm font-medium">Credits</h3>
          <Button
            onClick={showCreditsDepositInitiated}
            className="w-full"
            disabled={isLoading.creditsDepositInitiated}
          >
            {isLoading.creditsDepositInitiated
              ? "Loading..."
              : "Credits Deposit Initiated"}
          </Button>
          <Button
            onClick={showCreditsDepositCompleted}
            className="w-full"
            disabled={isLoading.creditsDepositCompleted}
          >
            {isLoading.creditsDepositCompleted
              ? "Loading..."
              : "Credits Deposit Complete"}
          </Button>
          <Button
            onClick={showCreditsWithdrawInitiated}
            className="w-full"
            disabled={isLoading.creditsWithdrawInitiated}
          >
            {isLoading.creditsWithdrawInitiated
              ? "Loading..."
              : "Credits Withdraw Initiated"}
          </Button>
          <Button
            onClick={showCreditsWithdrawCompleted}
            className="w-full"
            disabled={isLoading.creditsWithdrawCompleted}
          >
            {isLoading.creditsWithdrawCompleted
              ? "Loading..."
              : "Credits Withdraw Complete"}
          </Button>
        </div>

        <div>
          <h3 className="text-white text-sm font-medium">
            ControllerToaster Options
          </h3>
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
              value={disabledTypes.includes("network") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("network")}
            />
            Disable Network
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
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("user") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("user")}
            />
            Disable User
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("setting") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("setting")}
            />
            Disable Setting
          </div>
          <div className="flex gap-2">
            <Switch
              value={disabledTypes.includes("credits") ? 1 : 0}
              onCheckedChange={() => switchDisabledType("credits")}
            />
            Disable Credits
          </div>
          <div className="flex gap-2 pt-2">
            <Switch
              value={collapseTransactions ? 1 : 0}
              onCheckedChange={(value) => setCollapseTransactions(value)}
            />
            Collapse Transactions
          </div>
          <div className="pt-2">
            <Input
              type="number"
              placeholder="Custom duration (ms)"
              value={duration ?? ""}
              onChange={(e) =>
                setDuration(
                  e.target.value && !Number.isNaN(e.target.value)
                    ? Number(e.target.value)
                    : undefined,
                )
              }
            />
          </div>
        </div>
      </div>

      <ControllerToaster
        position={position}
        duration={duration}
        disabledTypes={disabledTypes}
        collapseTransactions={collapseTransactions}
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
            1. Add the {"<ControllerToaster />"} component to your game. 2. If
            you already have a sonner toaster, remove its {"<Toaster />"}{" "}
            component. 3. Or, if you want the controller toasters to be
            independent from your existing sonner toaster, give it a toasterId:{" "}
            {'<ControllerToaster toasterId="controller" />'}
          </h3>
          <pre className="bg-gray-800 p-2 rounded mt-1 text-xs">
            {`import { ControllerToaster } from "@cartridge/controller/react";
import "@cartridge/controller/react/styles.css";

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
