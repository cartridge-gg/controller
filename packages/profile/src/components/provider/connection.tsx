import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import { createContext, useState, ReactNode, useEffect } from "react";
import { ERC20, ProfileContextTypeVariant } from "@cartridge/controller";
import { normalize, STRK_CONTRACT_ADDRESS } from "@cartridge/utils";
import { constants, RpcProvider } from "starknet";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";
import { useNavigate, useSearchParams } from "react-router-dom";

type ConnectionContextType = {
  parent: ParentMethods;
  address: string;
  username: string;
  provider: RpcProvider;
  indexerUrl: string;
  chainId: string;
  erc20: ERC20[];
};

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

const initialState: ConnectionContextType = {
  parent: { close: async () => {} },
  address: "",
  username: "",
  provider: new RpcProvider(),
  indexerUrl: "",
  chainId: "",
  erc20: [],
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionContextType>(initialState);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const erc20 = (
      JSON.parse(
        decodeURIComponent(searchParams.get("erc20") ?? "[]"),
      ) as ERC20[]
    ).filter(
      (t) =>
        [ETH_CONTRACT_ADDRESS, STRK_CONTRACT_ADDRESS].includes(t.address) ?? [],
    );
    erc20.unshift({ address: STRK_CONTRACT_ADDRESS });
    erc20.unshift({ address: ETH_CONTRACT_ADDRESS });

    const newState = state;
    newState.erc20 = erc20;

    if (searchParams.get("address")) {
      newState.address = decodeURIComponent(searchParams.get("address")!);
    }

    if (searchParams.get("username")) {
      newState.username = decodeURIComponent(searchParams.get("username")!);
    }

    if (searchParams.get("rpcUrl")) {
      newState.provider = new RpcProvider({
        nodeUrl: decodeURIComponent(searchParams.get("rpcUrl")!),
      });
    }

    if (searchParams.get("indexerUrl")) {
      newState.indexerUrl = decodeURIComponent(searchParams.get("indexerUrl")!);
    }

    setState(newState);
  }, [searchParams, state]);

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
