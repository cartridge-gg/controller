import { connectToParent } from "@cartridge/penpal";
import { useState, ReactNode, useEffect, useCallback } from "react";
import { normalize } from "@cartridge/utils";
import { constants, RpcProvider } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ConnectionContext,
  ConnectionContextType,
  ParentMethods,
  initialState,
} from "@/context/connection";

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
