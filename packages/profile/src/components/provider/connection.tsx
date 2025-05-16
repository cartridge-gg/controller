import { connectToParent } from "@cartridge/penpal";
import { useState, ReactNode, useEffect, useCallback } from "react";
import {
  normalize,
  STRK_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";
import { constants, getChecksumAddress, RpcProvider } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ConnectionContext,
  ConnectionContextType,
  ParentMethods,
  initialState,
} from "#context/connection";
import { Token } from "@cartridge/controller";

// FIXME: rely on the one in ui once available
const LORDS_CONTRACT_ADDRESS = getChecksumAddress(
  "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
);

const TOKEN_ADDRESSES: Record<Token, string> = {
  eth: ETH_CONTRACT_ADDRESS,
  strk: STRK_CONTRACT_ADDRESS,
  lords: LORDS_CONTRACT_ADDRESS,
  usdc: USDC_CONTRACT_ADDRESS,
  usdt: USDT_CONTRACT_ADDRESS,
};

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

      const versionParam = searchParams.get("v");
      if (versionParam) {
        state.version = decodeURIComponent(versionParam);
      }

      const psParam = searchParams.get("ps");
      if (psParam) {
        state.project = decodeURIComponent(psParam);
      }

      const nsParam = searchParams.get("ns");
      if (nsParam) {
        state.namespace = decodeURIComponent(nsParam);
      }

      // It checks until it is enabled then it is never disabled
      const closableParam = searchParams.get("closable");
      if (closableParam !== undefined) {
        state.closable = closableParam === "true";
      }

      const visitorParam = searchParams.get("visitor");
      if (visitorParam !== undefined) {
        state.visitor = visitorParam === "true";
      }

      // Only update when erc20 state hasn't been set
      if (!state.erc20.length) {
        const erc20Param = searchParams.get("erc20");
        const addresses = erc20Param
          ? decodeURIComponent(erc20Param)
              .split(",")
              .map((token) => TOKEN_ADDRESSES[token as Token] || null)
              .filter((address) => address !== null)
          : [STRK_CONTRACT_ADDRESS];
        state.erc20 = addresses;
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

  const closeModal = useCallback(() => {
    setIsVisible(false);
    state.parent.close();
  }, [state.parent, setIsVisible]);

  const openSettings = useCallback(() => {
    state.parent.openSettings();
  }, [state.parent]);

  useEffect(() => {
    const connection = connectToParent<ParentMethods>({
      methods: {
        navigate: normalize(() => (path: string) => {
          navigate(path);
          setIsVisible(true);
        }),
        switchChain: normalize(() => (rpcUrl: string) => {
          setState((state) => ({
            ...state,
            provider: new RpcProvider({ nodeUrl: rpcUrl }),
          }));
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
    <ConnectionContext.Provider
      value={{ ...state, setIsVisible, closeModal, openSettings }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}
