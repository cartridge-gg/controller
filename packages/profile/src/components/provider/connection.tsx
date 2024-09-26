import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useQueryParams } from "./hooks";
import { ERC20, ProfileContextTypeVariant } from "@cartridge/controller";
import { normalize, STRK_CONTRACT_ADDRESS } from "@cartridge/utils";
import { constants, RpcProvider } from "starknet";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";

type ConnectionContextType = {
  parent: ParentMethods;
  address: string;
  username: string;
  context?: ContextVariant;
  setContext: (context: ContextVariant) => void;
  provider: RpcProvider;
  chainId: string;
  erc20: ERC20[];
};

type ProfileContext<Variant extends ProfileContextTypeVariant> = {
  type: Variant;
};

export type ContextVariant =
  | ProfileContext<"quest">
  | ProfileContext<"inventory">
  | ProfileContext<"history">;

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

const initialState: ConnectionContextType = {
  parent: { close: async () => {} },
  address: "",
  username: "",
  setContext: () => {},
  provider: new RpcProvider(),
  chainId: "",
  erc20: [],
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionContextType>(initialState);

  const searchParams = useQueryParams();
  useEffect(() => {
    const erc20 = (
      JSON.parse(decodeURIComponent(searchParams.get("erc20")!)) as ERC20[]
    ).filter(
      (t) =>
        [ETH_CONTRACT_ADDRESS, STRK_CONTRACT_ADDRESS].includes(t.address) ?? [],
    );
    erc20.unshift({ address: STRK_CONTRACT_ADDRESS });
    erc20.unshift({ address: ETH_CONTRACT_ADDRESS });

    setState((state) => ({
      ...state,
      address: decodeURIComponent(searchParams.get("address")!),
      username: decodeURIComponent(searchParams.get("username")!),
      provider: new RpcProvider({
        nodeUrl: decodeURIComponent(searchParams.get("rpcUrl")!),
      }),
      erc20,
    }));
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

  const setContext = useCallback((context: ContextVariant) => {
    setState((state) => ({
      ...state,
      context,
    }));
  }, []);

  useEffect(() => {
    const connection = connectToParent<ParentMethods>({
      methods: {
        goTo: normalize(() => (tab: ProfileContextTypeVariant) => {
          setContext({ type: tab });
        }),
      },
    });
    connection.promise.then((parent) => {
      setState((state) => ({ ...state, parent }));
    });

    return () => {
      connection.destroy();
    };
  }, [setContext]);

  return (
    <ConnectionContext.Provider value={{ ...state, setContext }}>
      {children}
    </ConnectionContext.Provider>
  );
}
