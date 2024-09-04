import React, { createContext, useEffect, useState } from "react";

type QueryParamsContextType = {
  searchParams: URLSearchParams;
};

export const QueryParamsContext = createContext<
  QueryParamsContextType | undefined
>(undefined);

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
