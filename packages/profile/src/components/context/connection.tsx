import { connectToParent } from "@cartridge/penpal";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ETH_CONTRACT_ADDRESS,
  normalize,
  STRK_CONTRACT_ADDRESS,
  useIndexerAPI,
} from "@cartridge/utils";
import { constants, getChecksumAddress, RpcProvider } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";

type ConnectionContextType = {
  parent: ParentMethods;
  provider?: RpcProvider;
  chainId: string;
  erc20: string[];
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
  erc20: [],
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

  const erc20 = useMemo(() => {
    const erc20Param = searchParams.get("erc20");
    return [
      ETH_CONTRACT_ADDRESS,
      STRK_CONTRACT_ADDRESS,
      ...(erc20Param
        ? decodeURIComponent(erc20Param)
            .split(",")
            .filter(
              (address) =>
                ![
                  getChecksumAddress(ETH_CONTRACT_ADDRESS),
                  getChecksumAddress(STRK_CONTRACT_ADDRESS),
                ].includes(getChecksumAddress(address)),
            )
        : []),
    ];
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
  const setIsVisible = useCallback((isVisible: boolean) => {
    setState((state) => ({ ...state, isVisible }));
  }, []);

  useEffect(() => {
    const connection = connectToParent<ParentMethods>({
      methods: {
        navigate: normalize(() => (path: string) => {
          navigate(path);
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
    <ConnectionContext.Provider value={{ ...state, erc20, setIsVisible }}>
      {children}
    </ConnectionContext.Provider>
  );
}
