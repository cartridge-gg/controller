import { createContext, ReactNode, useCallback, useState } from "react";

type IndexerAPIContextType = {
  indexerUrl: string;
  headers?: RequestInit["headers"];
  credentials?: RequestInit["credentials"];
  setIndexerUrl: (url: string) => void;
};

const initialState: IndexerAPIContextType = {
  indexerUrl: "",
  credentials: "omit",
  setIndexerUrl: () => {},
};

export const IndexerAPIContext =
  createContext<IndexerAPIContextType>(initialState);

export function IndexerAPIProvider({
  headers,
  children,
}: {
  headers?: RequestInit["headers"];
  children: ReactNode;
}) {
  const [state, setState] = useState({ ...initialState, headers });

  const setIndexerUrl = useCallback((indexerUrl: string) => {
    setState((state) => ({ ...state, indexerUrl }));
  }, []);

  return (
    <IndexerAPIContext.Provider value={{ ...state, setIndexerUrl }}>
      {children}
    </IndexerAPIContext.Provider>
  );
}
