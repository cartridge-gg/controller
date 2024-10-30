import { useAddressByUsernameQuery } from "@cartridge/utils/api/cartridge";
import { createContext, useState, ReactNode, useCallback } from "react";

type AccountContextType = {
  address: string;
  username: string;
  namespace: string;
  isFetching: boolean;
  setUsername: (username: string) => void;
};

const initialState: AccountContextType = {
  address: "",
  username: "",
  namespace: "",
  isFetching: false,
  setUsername: () => {},
};

export const AccountContext = createContext<AccountContextType>(initialState);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccountContextType>(initialState);

  const { data } = useAddressByUsernameQuery(
    { username: state.username },
    { enabled: !!state.username },
  );
  const address = data?.account?.controllers.edges?.[0]?.node?.address ?? "";

  const setUsername = useCallback((username: string) => {
    setState((state) => ({
      ...state,
      username,
    }));
  }, []);

  return (
    <AccountContext.Provider
      value={{
        ...state,
        address,
        setUsername,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
