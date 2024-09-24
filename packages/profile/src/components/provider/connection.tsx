import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useQueryParams } from "./hooks";
import { ProfileContextTypeVariant } from "@cartridge/controller";

type ConnectionContextType = {
  parent: ParentMethods;
  address: string;
  username: string;
  context: ContextVariant;
  setContext: (context: ContextVariant) => void;
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
  context: { type: "inventory" },
  setContext: () => {},
};

export const ConnectionContext =
  createContext<ConnectionContextType>(initialState);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionContextType>(initialState);

  useEffect(() => {
    const connection = connectToParent<ParentMethods>({
      // methods: {}
    });
    connection.promise.then((parent) => {
      setState((state) => ({ ...state, parent }));
    });

    return () => {
      connection.destroy();
    };
  }, []);

  const searchParams = useQueryParams();
  useEffect(() => {
    setState((state) => ({
      ...state,
      address: decodeURIComponent(searchParams.get("address")!),
      username: decodeURIComponent(searchParams.get("username")!),
      context: {
        type:
          (searchParams.get("tab") as ProfileContextTypeVariant) ??
          state.context,
      },
    }));
  }, [searchParams]);

  const setContext = useCallback((context: ContextVariant) => {
    setState((state) => ({
      ...state,
      context,
    }));
  }, []);

  return (
    <ConnectionContext.Provider value={{ ...state, setContext }}>
      {children}
    </ConnectionContext.Provider>
  );
}
