import { useContext } from "react";
import { ConnectionContext } from "@/components/provider/connection";
import { ColorSchemeProviderContext } from "@/components/provider/colorScheme";
import { AccountContext } from "@/components/provider/account";
import { getChecksumAddress } from "starknet";

export function useColorScheme() {
  const context = useContext(ColorSchemeProviderContext);

  if (context === undefined)
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");

  return context;
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useAccount() {
  return useContext(AccountContext);
}

export function useTokenBalance(address: string) {
  const { erc20 } = useAccount();

  return erc20.find(
    (t) => getChecksumAddress(t.address) === getChecksumAddress(address),
  )?.balance;
}
