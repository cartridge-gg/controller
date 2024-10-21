import { createContext, ReactNode, useCallback, useState } from "react";

type IndexerAPIContextType = {
  url: string;
  headers?: RequestInit["headers"],
  setUrl: (url: string) => void
};

const initialState: IndexerAPIContextType = {
  url: "",
  setUrl: () => { }
};

export const IndexerAPIContext = createContext<IndexerAPIContextType>(initialState);

export function IndexerAPIProvider({ headers, children }: { headers?: RequestInit["headers"]; children: ReactNode }) {
  const [state, setState] = useState({ ...initialState, headers })

  const setUrl = useCallback((url: string) => {
    setState(state => ({ ...state, url }))
  }, [])

  return (
    <IndexerAPIContext.Provider value={{ ...state, setUrl }}>{children}</IndexerAPIContext.Provider>
  );
}
