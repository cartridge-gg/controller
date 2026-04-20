import { createContext, ReactNode, useState } from "react";

type IndexerAPIContextType = {
  indexerUrl?: string;
  credentials?: RequestInit["credentials"];
  headers?: RequestInit["headers"];
  isReady: boolean;
  setIndexerUrl: (url: string) => void;
};

const initialState: IndexerAPIContextType = {
  setIndexerUrl: () => {},
  isReady: false,
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
  const [indexerUrl, setIndexerUrl] = useState(initialState.indexerUrl);

  return (
    <IndexerAPIContext.Provider
      value={{
        indexerUrl,
        setIndexerUrl,
        credentials,
        headers,
        isReady: !!indexerUrl,
      }}
    >
      {children}
    </IndexerAPIContext.Provider>
  );
}
