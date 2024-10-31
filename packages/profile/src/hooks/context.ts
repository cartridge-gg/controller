import { useContext } from "react";
import { ColorSchemeContext, ConnectionContext } from "@/components/context";
import { getChecksumAddress } from "starknet";
import { useERC20Balance } from "@cartridge/utils";

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);

  if (context === undefined)
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");

  return context;
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useToken(address: string) {
  const { erc20: contractAddress, provider, isVisible } = useConnection();
  const { data: erc20 } = useERC20Balance({
    address,
    contractAddress,
    provider,
    interval: isVisible ? 3000 : undefined,
  });

  return erc20.find(
    (t) => getChecksumAddress(t.meta.address) === getChecksumAddress(address),
  );
}
