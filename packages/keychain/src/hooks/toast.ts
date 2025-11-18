import {
  showAchievementToast,
  showNetworkSwitchToast,
  showErrorToast,
  showTransactionToast,
  useToast,
  AchievementToastProps,
  NetworkSwitchToastProps,
  ErrorToastProps,
  TransactionNotificationProps,
} from "@cartridge/ui";
import { useConnection } from "./connection";

interface SpecializedToastHandlers {
  handleShowAchievementToast: (props: AchievementToastProps) => Promise<void>;
  handleShowNetworkSwitchToast: (
    props: NetworkSwitchToastProps,
  ) => Promise<void>;
  handleShowErrorToast: (props: ErrorToastProps) => Promise<void>;
  handleShowTransactionToast: (
    props: TransactionNotificationProps,
  ) => Promise<void>;
}

export const useSpecializedToast = (): SpecializedToastHandlers => {
  const { parent } = useConnection();
  const { toast } = useToast();

  const handleShowAchievementToast = async ({
    ...props
  }: Omit<AchievementToastProps, "type">) => {
    if (parent) {
      await parent.showToast({
        type: "achievement",
        ...props,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showAchievementToast({
          ...props,
        }),
      );
    }
  };

  const handleShowNetworkSwitchToast = async ({
    ...props
  }: Omit<NetworkSwitchToastProps, "type">) => {
    if (parent) {
      await parent.showToast({
        type: "networkSwitch",
        ...props,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showNetworkSwitchToast({
          ...props,
        }),
      );
    }
  };

  const handleShowErrorToast = async ({
    ...props
  }: Omit<ErrorToastProps, "type">) => {
    if (parent) {
      await parent.showToast({
        type: "error",
        ...props,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showErrorToast({
          ...props,
        }),
      );
    }
  };

  const handleShowTransactionToast = async ({
    ...props
  }: Omit<TransactionNotificationProps, "type">) => {
    if (parent) {
      await parent.showToast({
        type: "transaction",
        ...props,
      });
    } else {
      // Fallback for standalone mode
      toast(
        showTransactionToast({
          ...props,
        }),
      );
    }
  };

  return {
    handleShowAchievementToast,
    handleShowNetworkSwitchToast,
    handleShowErrorToast,
    handleShowTransactionToast,
  };
};
