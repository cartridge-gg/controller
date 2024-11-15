import { connectToParent } from "@cartridge/penpal";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {
  ETH_CONTRACT_ADDRESS,
  isIframe,
  normalize,
  STRK_CONTRACT_ADDRESS,
} from "@cartridge/utils";
import { Call, constants, getChecksumAddress, RpcProvider } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";

type ConnectionContextType = {
  parent: ParentMethods;
  provider: RpcProvider;
  chainId: string;
  erc20: string[];
  namespace?: string;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

type ParentMethods = {
  close: () => void;
  openPurchaseCredits: () => void;
  openExecute: (calls: Call[]) => void;
};

const initialState: ConnectionContextType = {
  parent: {
    close: () => {},
    openPurchaseCredits: () => {},
    openExecute: () => {},
  },
  provider: new RpcProvider({ nodeUrl: import.meta.env.VITE_RPC_SEPOLIA }),
  chainId: "",
  erc20: [],
  isVisible: !isIframe(),
  setIsVisible: () => {},
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionContextType>(initialState);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    // Keep in state so searchParams only required at the beginning
    setState((state) => {
      const rpcUrlParam = searchParams.get("rpcUrl");
      if (rpcUrlParam) {
        state.provider = new RpcProvider({
          nodeUrl: decodeURIComponent(rpcUrlParam),
        });
      }

      const nsParam = searchParams.get("ns");
      if (nsParam && !state.namespace) {
        state.namespace = decodeURIComponent(nsParam);
      }

      // Only update when erc20 state hasn't been set
      if (!state.erc20.length) {
        const erc20Param = searchParams.get("erc20");
        state.erc20 = [
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
      }
      return state;
    });
  }, [searchParams]);

  useEffect(() => {
    updateChainId();

    async function updateChainId() {
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
  }, [navigate, setIsVisible, searchParams]);

  return (
    <ConnectionContext.Provider value={{ ...state, setIsVisible }}>
      {children}
    </ConnectionContext.Provider>
  );
}
