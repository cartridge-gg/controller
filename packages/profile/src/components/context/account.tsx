import { createContext, useState, ReactNode, useEffect } from "react";
import {
  ERC20,
  ERC20Metadata,
  ETH_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
} from "@cartridge/utils";
import { useConnection } from "@/hooks/context";
import { useSearchParams } from "react-router-dom";
import { ERC20 as ERC20Option } from "@cartridge/controller";
import { getChecksumAddress } from "starknet";

type ERC20Status = ERC20Metadata & {
  balance?: number;
  error?: Error;
};

type AccountContextType = {
  address: string;
  username: string;
  erc20: (ERC20Status & {
    balance?: number;
    error?: Error;
  })[];
  isFetching: boolean;
};

const initialState: AccountContextType = {
  address: "",
  username: "",
  erc20: [],
  isFetching: false,
};

export const AccountContext = createContext<AccountContextType>(initialState);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const { provider } = useConnection();
  const [state, setState] = useState<AccountContextType>(initialState);

  useEffect(() => {
    setState((state) => {
      const addressParam = searchParams.get("address");
      if (addressParam) {
        state.address = decodeURIComponent(addressParam);
      }

      const usernameParam = searchParams.get("username");
      if (usernameParam) {
        state.username = decodeURIComponent(usernameParam);
      }

      return state;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchERC20Metadata();

    async function fetchERC20Metadata() {
      const erc20Param = searchParams.get("erc20");
      if (!provider || state.erc20.length || !erc20Param) return;

      const options = (
        JSON.parse(decodeURIComponent(erc20Param)) as ERC20Option[]
      ).filter((t) =>
        [ETH_CONTRACT_ADDRESS, STRK_CONTRACT_ADDRESS].includes(t.address),
      );
      options.unshift({ address: STRK_CONTRACT_ADDRESS });
      options.unshift({ address: ETH_CONTRACT_ADDRESS });

      const metadata = await ERC20.fetchAllMetadata();
      const res = await Promise.allSettled(
        options.map((opt) =>
          new ERC20({
            address: opt.address,
            provider,
            logoUrl:
              opt.logoUrl ||
              metadata.find(
                (meta) =>
                  getChecksumAddress(meta.address) ===
                  getChecksumAddress(opt.address),
              )?.logoUrl,
          }).init(),
        ),
      );

      const erc20 = res
        .filter((res) => res.status === "fulfilled")
        .map((res) => res.value);
      if (!erc20.length) return;

      setState((state) => ({ ...state, erc20 }));
    }
  }, [searchParams, provider, state.erc20.length]);

  useEffect(() => {
    if (!state.erc20.find(t => t.balance === undefined)) return

    updateBalance();
    setInterval(updateBalance, 3000);

    async function updateBalance() {
      const res = await Promise.allSettled(
        state.erc20.map((t) => t.instance.balanceOf(state.address)),
      );
      const erc20 = res.reduce<ERC20Status[]>(
        (prev, res, i) =>
          res.status === "fulfilled"
            ? [...prev, { ...state.erc20[i], balance: res.value }]
            : [...prev, state.erc20[i]],
        [],
      );

      setState((state) => ({
        ...state,
        erc20,
      }));
    }
  }, [state.erc20, state.address]);

  return (
    <AccountContext.Provider value={state}>{children}</AccountContext.Provider>
  );
}
