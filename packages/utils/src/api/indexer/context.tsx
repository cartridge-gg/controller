import { createContext, ReactNode, useCallback, useState } from "react";

type IndexerAPIContextType = {
  url: string;
  namespace?: string;
  headers?: RequestInit["headers"],
  setUrl: (url: string) => void
  setNamespace: (namespace: string) => void
};

const initialState: IndexerAPIContextType = {
  url: "",
  namespace: undefined,
  setUrl: () => { },
  setNamespace: () => { }
};

export const IndexerAPIContext = createContext<IndexerAPIContextType>(initialState);

export function IndexerAPIProvider({ headers, children }: { headers?: RequestInit["headers"]; children: ReactNode }) {
  const [state, setState] = useState({ ...initialState, headers })

  const setUrl = useCallback((url: string) => {
    setState(state => ({ ...state, url }))
  }, [])

  const setNamespace = useCallback((namespace: string) => {
    setState(state => ({ ...state, namespace }))
  }, [])

  return (
    <IndexerAPIContext.Provider value={{ ...state, setUrl, setNamespace }}>{children}</IndexerAPIContext.Provider>
  );
}
