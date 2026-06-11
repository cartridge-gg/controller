import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { DepositCredits } from "./DepositCredits";
import { PaymentMethodSelection } from "../purchase/checkout/onchain/wallet-drawer";

export type CreditDepositStatus = "processing" | "success" | "error" | "idle";

export type CreditsContextValue = {
  initiateCreditsDeposit: (onSuccessCallback?: () => Promise<void>) => void;
  onDepositStarted: (
    paymentMethod: PaymentMethodSelection,
    amount: number,
  ) => void;
  onDepositFinished: (error?: string) => Promise<void>;
  depositInProgress: null | {
    paymentMethod: PaymentMethodSelection;
    amount: number;
    status: CreditDepositStatus;
  };
};

type DepositInProgress = CreditsContextValue["depositInProgress"];

export const CreditsContext = createContext<CreditsContextValue>({
  initiateCreditsDeposit: () => {},
  onDepositStarted: () => {},
  onDepositFinished: async () => {},
  depositInProgress: null,
});

export function CreditsProvider({ children }: PropsWithChildren) {
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const [depositInProgress, setDepositInProgress] =
    useState<DepositInProgress | null>(null);

  const [depositSuccessCallback, setDepositSuccessCallback] = useState<
    (() => Promise<void>) | undefined
  >(undefined);
  const initiateCreditsDeposit = useCallback(
    (onSuccessCallback?: () => Promise<void>) => {
      setDepositSuccessCallback(() => onSuccessCallback);
      setIsDepositOpen(true);
    },
    [],
  );

  const onDepositStarted = useCallback(
    async (paymentMethod: PaymentMethodSelection, amount: number) => {
      setDepositInProgress({
        paymentMethod,
        amount,
        status: "processing",
      });
    },
    [],
  );

  const onDepositFinished = useCallback(
    async (error?: string) => {
      setDepositInProgress((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: error ? "error" : "success",
        };
      });
      if (!error) {
        await depositSuccessCallback?.();
      }
    },
    [depositSuccessCallback, setDepositInProgress],
  );

  const handleClose = useCallback(() => {
    setDepositSuccessCallback(undefined);
    setDepositInProgress(null);
    setIsDepositOpen(false);
  }, []);

  return (
    <CreditsContext.Provider
      value={{
        initiateCreditsDeposit,
        onDepositStarted,
        onDepositFinished,
        depositInProgress,
      }}
    >
      {children}

      <DepositCredits isOpen={isDepositOpen} onClose={handleClose} />
    </CreditsContext.Provider>
  );
}

export const useCreditsContext = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCreditsContext must be used within an CreditsProvider");
  }
  return context;
};
