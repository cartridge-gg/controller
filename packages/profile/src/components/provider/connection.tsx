import { createContext, useContext, useState } from "react";

type ConnectionState = {};

type ConnectionProviderProps = {
  children: React.ReactNode;
};

const initialState: ConnectionState = {};

const ConnectionContext = createContext<ConnectionState | undefined>(undefined);

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [state, setState] = useState<ConnectionState>(initialState);

  return (
    <ConnectionContext.Provider value={state}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
