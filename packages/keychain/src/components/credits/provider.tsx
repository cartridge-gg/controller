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
    /** Failure/timeout message when status is "error". */
    error?: string;
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
        // prev is null when the user closed the status view before settlement
        // finished — stay closed, but still run the success side effects.
        if (!prev) return null;
        return {
          ...prev,
          status: error ? "error" : "success",
          error,
        };
      });
      if (!error) {
        await depositSuccessCallback?.();
      }
    },
    [depositSuccessCallback, setDepositInProgress],
  );

  // Deliberately keep depositSuccessCallback across close: a fiat settlement
  // can outlive the drawer (the user may close while it's processing), and the
  // waiting flow (e.g. bundle purchase) still wants its balance refreshed when
  // the credits land. The callback is replaced on the next initiateCreditsDeposit.
  const handleClose = useCallback(() => {
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
