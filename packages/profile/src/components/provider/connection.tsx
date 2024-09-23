import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import { createContext, useState, ReactNode, useEffect } from "react";
import { useQueryParams } from "./hooks";

type ConnectionContextType = {
  parent: ParentMethods;
  address: string;
  username: string;
};
type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

const initialState: ConnectionContextType = {
  parent: { close: async () => {} },
  address: "",
  username: "",
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
    }));
  }, [searchParams]);

  return (
    <ConnectionContext.Provider value={state}>
      {children}
    </ConnectionContext.Provider>
  );
}
