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
  balance?: bigint;
  error?: Error;
};

type AccountContextType = {
  address: string;
  username: string;
  erc20: (ERC20Status & {
    balance?: bigint;
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
  const { provider, isVisible } = useConnection();
  const [state, setState] = useState<AccountContextType>(initialState);
  const [erc20, setERC20] = useState<ERC20[]>([]);

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
    (async function () {
      if (!provider) return;

      const erc20Param = searchParams.get("erc20");

      const options = erc20Param
        ? (JSON.parse(decodeURIComponent(erc20Param)) as ERC20Option[]).filter(
            (t) =>
              ![
                getChecksumAddress(ETH_CONTRACT_ADDRESS),
                getChecksumAddress(STRK_CONTRACT_ADDRESS),
              ].includes(getChecksumAddress(t.address)),
          )
        : [];
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

      const newValue = res
        .filter((res) => res.status === "fulfilled")
        .map((res) => res.value);

      setERC20(newValue);
    })();
  }, [provider, searchParams]);

  useEffect(() => {
    updateBalance();
    if (!isVisible) return;

    const id = setInterval(updateBalance, 3000);

    return () => {
      clearInterval(id);
    };

    async function updateBalance() {
      if (!erc20.length) return;

      setState((state) => ({ ...state, isFetching: true }));

      const res = await Promise.allSettled(
        erc20.map((t) => t.balanceOf(state.address)),
      );
      const newValue = res.reduce<ERC20Status[]>(
        (prev, res, i) =>
          res.status === "fulfilled"
            ? [...prev, { ...erc20[i].metadata(), balance: res.value }]
            : prev,
        [],
      );

      setState((state) => ({
        ...state,
        erc20: newValue,
        isFetching: false,
      }));
    }
  }, [isVisible, erc20, state.address]);

  return (
    <AccountContext.Provider value={state}>{children}</AccountContext.Provider>
  );
}
