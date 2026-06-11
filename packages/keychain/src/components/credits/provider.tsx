import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { DepositCredits } from "./DepositCredits";

export type CreditsContextValue = {
  initiateCreditsDeposit: (onSuccessCallback?: () => Promise<void>) => void;
  // Status of the active credits deposit flow
  amount: number;
  depositInProgress: boolean;
};

export const CreditsContext = createContext<CreditsContextValue>({
  initiateCreditsDeposit: () => {},
  amount: 0,
  depositInProgress: false,
});

export function CreditsProvider({ children }: PropsWithChildren) {
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const [_depositSuccessCallback, setDepositSuccessCallback] = useState<
    (() => Promise<void>) | undefined
  >(undefined);
  const initiateCreditsDeposit = useCallback(
    (onSuccessCallback?: () => Promise<void>) => {
      setDepositSuccessCallback(() => onSuccessCallback);
      setIsDepositOpen(true);
    },
    [],
  );

  return (
    <CreditsContext.Provider
      value={{
        initiateCreditsDeposit,
        amount: 0,
        depositInProgress: false,
      }}
    >
      {children}

      <DepositCredits
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
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
