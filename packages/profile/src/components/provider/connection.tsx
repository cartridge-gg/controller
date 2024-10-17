import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import { createContext, useState, ReactNode, useEffect } from "react";
import { ProfileContextTypeVariant } from "@cartridge/controller";
import { normalize } from "@cartridge/utils";
import { constants, RpcProvider } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";

type ConnectionContextType = {
  parent: ParentMethods;
  provider?: RpcProvider;
  indexerUrl: string;
  chainId: string;
};

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

const initialState: ConnectionContextType = {
  parent: { close: async () => {} },
  indexerUrl: "",
  chainId: "",
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionContextType>(initialState);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    setState((state) => {
      if (searchParams.get("rpcUrl")) {
        state.provider = new RpcProvider({
          nodeUrl: decodeURIComponent(searchParams.get("rpcUrl")!),
        });
      }

      if (searchParams.get("indexerUrl")) {
        state.indexerUrl = decodeURIComponent(searchParams.get("indexerUrl")!);
      }

      return state;
    });
  }, [searchParams]);

  useEffect(() => {
    updateChainId();

    async function updateChainId() {
      if (!state.provider) return;

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Chain ID fetch timed out")), 3000),
        );
        const chainIdPromise = state.provider.getChainId();
        const chainId = (await Promise.race([
          chainIdPromise,
          timeoutPromise,
        ])) as constants.StarknetChainId;
        setState((state) => ({ ...state, chainId }));
      } catch (e) {
        console.error(e);
      }
    }
  }, [state.provider]);

  const navigate = useNavigate();

  useEffect(() => {
    const connection = connectToParent<ParentMethods>({
      methods: {
        navigate: normalize(() => (tab: ProfileContextTypeVariant) => {
          navigate(tab);
        }),
      },
    });
    connection.promise.then((parent) => {
      setState((state) => ({ ...state, parent }));
    });

    return () => {
      connection.destroy();
    };
  }, [navigate]);

  return (
    <ConnectionContext.Provider value={state}>
      {children}
    </ConnectionContext.Provider>
  );
}
