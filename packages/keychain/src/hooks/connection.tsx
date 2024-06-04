import { AsyncMethodReturns } from "@cartridge/penpal";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
} from "react";
import Controller from "utils/controller";
import { constants } from "starknet";
import { connectToController, ConnectionCtx } from "utils/connection";

const ConnectionContext = createContext<ConnectionContextValue>(undefined);

type ConnectionContextValue = {
  controller: Controller;
  setController: (controller: Controller) => void;
  context: ConnectionCtx;
  setContext: (context: ConnectionCtx) => void;
  chainId: constants.StarknetChainId;
  close: () => void;
};

export function ConnectionProvider({ children }: PropsWithChildren) {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [chainId, setChainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.SN_SEPOLIA,
  );
  const [controller, setController] = useState(Controller.fromStore);

  useEffect(() => {
    if (typeof window === "undefined" || window.self === window.top) {
      return;
    }

    const connection = connectToController({
      chainId,
      setChainId,
      setContext,
      setController,
    });
    connection.promise.then((parent) =>
      setParent(parent as unknown as ParentMethods),
    );

    return () => {
      connection.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(async () => {
    if (!parent) return;

    try {
      await parent.close();
    } catch (e) {
      // Always fails for some reason
    }
  }, [parent]);

  return (
    <ConnectionContext.Provider
      value={{
        controller,
        setController,
        chainId,
        context,
        setContext,
        close,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnection() {
  const ctx = useContext<ConnectionContextValue>(ConnectionContext);
  if (!ctx) {
    throw new Error("ConnectionProvider must be placed");
  }

  return ctx;
}
