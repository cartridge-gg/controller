import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";

type AccountContextType = {
  address: string;
  username: string;
  namespace: string;
  isFetching: boolean;
  setAccount: (account: { username: string; address: string }) => void;
};

const initialState: AccountContextType = {
  address: "",
  username: "",
  namespace: "",
  isFetching: false,
  setAccount: () => {},
};

export const AccountContext = createContext<AccountContextType>(initialState);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<AccountContextType>(initialState);

  useEffect(() => {
    setState((state) => {
      const namespaceParam = searchParams.get("namespace");
      if (namespaceParam) {
        state.namespace = decodeURIComponent(namespaceParam);
      }

      return state;
    });
  }, [searchParams]);

  const setAccount = useCallback(
    ({ username, address }: { username: string; address: string }) => {
      setState((state) => ({
        ...state,
        address,
        username,
      }));
    },
    [],
  );

  return (
    <AccountContext.Provider
      value={{
        ...state,
        setAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
