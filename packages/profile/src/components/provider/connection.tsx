import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import { createContext, useState, ReactNode, useEffect } from "react";

type ConnectionContextType = {
  parent: ParentMethods;
};
type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

const initialState: ConnectionContextType = {
  parent: { close: async () => { } },
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

  return (
    <ConnectionContext.Provider value={state}>
      {children}
    </ConnectionContext.Provider>
  );
}
