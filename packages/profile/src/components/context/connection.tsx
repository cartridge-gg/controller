import { connectToParent } from "@cartridge/penpal";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { ProfileContextTypeVariant } from "@cartridge/controller";
import { normalize, useIndexerAPI } from "@cartridge/utils";
import { constants, RpcProvider } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";

type ConnectionContextType = {
  parent: ParentMethods;
  provider?: RpcProvider;
  chainId: string;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

type ParentMethods = {
  close: () => Promise<void>;
  openPurchaseCredits: () => Promise<void>;
};

const initialState: ConnectionContextType = {
  parent: { close: async () => {}, openPurchaseCredits: async () => {} },
  chainId: "",
  isVisible: false,
  setIsVisible: () => {},
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionContextType>(initialState);
  const { setUrl, setNamespace } = useIndexerAPI();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    setState((state) => {
      if (searchParams.get("rpcUrl")) {
        state.provider = new RpcProvider({
          nodeUrl: decodeURIComponent(searchParams.get("rpcUrl")!),
        });
      }

      return state;
    });

    if (searchParams.get("indexerUrl")) {
      setUrl(decodeURIComponent(searchParams.get("indexerUrl")!));
    }
    if (searchParams.get("namespace")) {
      setNamespace(decodeURIComponent(searchParams.get("namespace")!));
    }
  }, [searchParams, setUrl, setNamespace]);

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
  const setIsVisible = useCallback((isVisible: boolean) => {
    setState((state) => ({ ...state, isVisible }));
  }, []);

  useEffect(() => {
    const connection = connectToParent<ParentMethods>({
      methods: {
        navigate: normalize(() => (tab: ProfileContextTypeVariant) => {
          navigate(tab);
          setIsVisible(true);
        }),
      },
    });
    connection.promise.then((parent) => {
      setState((state) => ({ ...state, parent }));
    });

    return () => {
      connection.destroy();
    };
  }, [navigate, setIsVisible]);

  return (
    <ConnectionContext.Provider value={{ ...state, setIsVisible }}>
      {children}
    </ConnectionContext.Provider>
  );
}
