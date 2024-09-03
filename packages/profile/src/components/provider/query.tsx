import React, { createContext, useContext, useEffect, useState } from "react";

type QueryParamsContextType = {
  searchParams: URLSearchParams;
};

const QueryParamsContext = createContext<QueryParamsContextType | undefined>(
  undefined,
);

export function QueryParamsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return (
    <QueryParamsContext.Provider value={{ searchParams }}>
      {children}
    </QueryParamsContext.Provider>
  );
}

export function useQueryParams() {
  const context = useContext(QueryParamsContext);
  if (context === undefined) {
    throw new Error("useQueryParams must be used within a QueryParamsProvider");
  }
  return context.searchParams;
}
