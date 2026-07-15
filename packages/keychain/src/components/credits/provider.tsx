import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { DepositCredits } from "./DepositCredits";
import { PaymentMethodSelection } from "../purchase/checkout/onchain/wallet-drawer";

export type CreditDepositStatus = "processing" | "success" | "error" | "idle";

export type CreditsDepositRequest = {
  preferredMethod?: PaymentMethodSelection;
  minimumAmount?: number;
  purchaseKey?: string;
  onSuccess?: () => Promise<void>;
};

export type ActiveCreditsDepositRequest = CreditsDepositRequest & {
  attemptId: string;
};

export type CreditsContextValue = {
  initiateCreditsDeposit: (request?: CreditsDepositRequest) => void;
  onDepositStarted: (
    paymentMethod: PaymentMethodSelection,
    amount: number,
  ) => string;
  onDepositFinished: (attemptId: string, error?: string) => Promise<void>;
  depositInProgress: null | {
    paymentMethod: PaymentMethodSelection;
    amount: number;
    attemptId: string;
    status: CreditDepositStatus;
    /** Failure/timeout message when status is "error". */
    error?: string;
  };
  depositRequest?: ActiveCreditsDepositRequest;
};

type DepositInProgress = CreditsContextValue["depositInProgress"];

export const CreditsContext = createContext<CreditsContextValue>({
  initiateCreditsDeposit: () => {},
  onDepositStarted: () => "",
  onDepositFinished: async () => {},
  depositInProgress: null,
  depositRequest: undefined,
});

export function CreditsProvider({ children }: PropsWithChildren) {
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const [depositInProgress, setDepositInProgress] =
    useState<DepositInProgress | null>(null);

  const [depositRequest, setDepositRequest] =
    useState<ActiveCreditsDepositRequest>();
  const attemptCounterRef = useRef(0);
  const consumedAttemptsRef = useRef(new Set<string>());
  const initiateCreditsDeposit = useCallback(
    (request?: CreditsDepositRequest) => {
      attemptCounterRef.current += 1;
      setDepositRequest({
        ...request,
        attemptId: `credits-deposit-${attemptCounterRef.current}`,
      });
      setIsDepositOpen(true);
    },
    [],
  );

  const onDepositStarted = useCallback(
    (paymentMethod: PaymentMethodSelection, amount: number) => {
      const attemptId =
        depositRequest?.attemptId ??
        `credits-deposit-${attemptCounterRef.current}`;
      setDepositInProgress({
        paymentMethod,
        amount,
        attemptId,
        status: "processing",
      });
      return attemptId;
    },
    [depositRequest],
  );

  const onDepositFinished = useCallback(
    async (attemptId: string, error?: string) => {
      if (!attemptId || depositRequest?.attemptId !== attemptId) return;
      let completionError = error;
      if (!completionError && !consumedAttemptsRef.current.has(attemptId)) {
        consumedAttemptsRef.current.add(attemptId);
        const callback = depositRequest?.onSuccess;
        // Consume before awaiting so duplicate settlement signals cannot debit
        // the originating bundle twice.
        setDepositRequest((current) =>
          current?.attemptId === attemptId
            ? { ...current, onSuccess: undefined }
            : current,
        );
        try {
          await callback?.();
        } catch (callbackError) {
          completionError =
            callbackError instanceof Error
              ? callbackError.message
              : String(callbackError);
        }
      }

      setDepositInProgress((prev) => {
        // prev is null when the user closed the status view before settlement
        // finished — stay closed, but still run the success side effects.
        if (!prev || prev.attemptId !== attemptId) return prev;
        return {
          ...prev,
          status: completionError ? "error" : "success",
          error: completionError,
        };
      });
    },
    [depositRequest, setDepositInProgress],
  );

  // Deliberately keep the deposit request across close: a fiat settlement
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
        depositRequest,
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
