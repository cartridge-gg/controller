import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ChainId } from "caip";
import CheckmarkIcon from "components/icons/Checkmark";
import { constants, shortString } from "starknet";
import { ethers } from "ethers";
import { formatAddress } from "utils/contracts";
import { RpcProvider } from "starknet";
import Controller from "utils/controller";
import Chain from "@cartridge/ui/components/menu/Chain";
import account from "utils/account";
import { useToast } from "@chakra-ui/react";
import Toast from "components/Toast";
import TransactionIcon from "components/icons/Transaction";
import WarningIcon from "components/icons/Warning";
import TimerIcon from "@cartridge/ui/components/icons/Timer";

export interface PendingTransaction {
  hash: string;
  chainId: constants.StarknetChainId;
  label?: string;
}

interface PendingInterface {
  pendingTransactions: PendingTransaction[];
  finalizedTransactions: (PendingTransaction & {
    state: "success" | "error";
  })[];
  add: (tx: PendingTransaction) => void;
  remove: (hash: string) => void;
}

const PendingContext = createContext<PendingInterface>(undefined);

export const usePendingTransactions = () => useContext(PendingContext);

export function PendingProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [finalizedTransactions, setFinalizedTransactions] = useState<
    (PendingTransaction & { state: "success" | "error" })[]
  >([]);
  const controller = useMemo(() => Controller.fromStore(), []);
  const toast = useToast({
    position: "top-right",
    duration: 3000,
    render: (props) => (
      <Toast icon={<TransactionIcon w="28px" h="28px" />} {...(props as any)} />
    ),
  });

  // const provider = new RpcProvider({
  //     nodeUrl: "https://alpha4.starknet.io/feeder_gateway"
  // });

  const onConfirmed = useCallback(
    (tx: PendingTransaction) => {
      setFinalizedTransactions((prev) => [
        ...prev,
        { ...tx, state: "success" },
      ]);

      toast({
        title: "Transaction confirmed",
        description: `Transaction ${
          tx.label || formatAddress(tx.hash)
        } has been confirmed`,
        icon: <CheckmarkIcon w="28px" h="28px" />,
      });

      setPendingTransactions((prev) => prev.filter((t) => t.hash !== tx.hash));
    },
    [toast],
  );

  const onFailed = useCallback(
    (tx: PendingTransaction) => {
      setFinalizedTransactions((prev) => [...prev, { ...tx, state: "error" }]);

      toast({
        title: "Transaction failed",
        description: `Transaction ${
          tx.label || formatAddress(tx.hash)
        } has failed`,
        icon: <WarningIcon w="28px" h="28px" />,
      });
    },
    [toast],
  );

  const add = useCallback(
    (tx: PendingTransaction) => {
      toast({
        title: "Transaction pending",
        description: `Transaction ${
          tx.label || formatAddress(tx.hash)
        } is pending`,
        icon: <TimerIcon w="28px" h="28px" />,
      });
      setPendingTransactions((prev) => [...prev, tx]);

      controller
        .account(tx.chainId)
        .waitForTransaction(tx.hash)
        .then(() => {
          onConfirmed(tx);
        })
        .catch(() => {
          onFailed(tx);
        });
    },
    [account, onConfirmed],
  );

  const remove = useCallback((hash: string) => {
    setPendingTransactions((prev) => prev.filter((t) => t.hash !== hash));
  }, []);

  return (
    <PendingContext.Provider
      value={{
        pendingTransactions,
        finalizedTransactions,
        add,
        remove,
      }}
    >
      {children}
    </PendingContext.Provider>
  );
}
