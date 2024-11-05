import { createContext, ReactNode, useCallback, useState } from "react";

type IndexerAPIContextType = {
  indexerUrl: string;
  credentials?: RequestInit["credentials"];
  headers?: RequestInit["headers"];
  setIndexerUrl: (url: string) => void;
};

const initialState: IndexerAPIContextType = {
  indexerUrl: "",
  setIndexerUrl: () => {},
};

export const IndexerAPIContext =
  createContext<IndexerAPIContextType>(initialState);

export function IndexerAPIProvider({
  credentials,
  headers,
  children,
}: {
  credentials?: RequestInit["credentials"];
  headers?: RequestInit["headers"];
  children: ReactNode;
}) {
  const [state, setState] = useState({ ...initialState, credentials, headers });

  const setIndexerUrl = useCallback((indexerUrl: string) => {
    setState((state) => ({ ...state, indexerUrl }));
  }, []);

  return (
    <IndexerAPIContext.Provider value={{ ...state, setIndexerUrl }}>
      {children}
    </IndexerAPIContext.Provider>
  );
}
