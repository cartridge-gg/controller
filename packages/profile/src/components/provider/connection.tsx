import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useQueryParams } from "./hooks";
import {
  ERC20,
  ERC1155,
  ProfileContextTypeVariant,
} from "@cartridge/controller";
import { normalize, STRK_CONTRACT_ADDRESS } from "@cartridge/utils";
import { RpcProvider } from "starknet";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";

type ConnectionContextType = {
  parent: ParentMethods;
  address: string;
  username: string;
  context?: ContextVariant;
  setContext: (context: ContextVariant) => void;
  provider: RpcProvider;
  erc20: ERC20[];
  erc1155: ERC1155[];
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
  erc20: [],
  erc1155: [],
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
      erc1155: JSON.parse(
        decodeURIComponent(searchParams.get("erc1155")!) ?? [],
      ),
    }));
  }, [searchParams]);

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
