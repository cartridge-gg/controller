import { PropsWithChildren, useEffect } from "react";
import {
  TokensProvider as TokensProviderRaw,
  useTokens,
} from "@cartridge/utils";
import { useConnection } from "@/hooks/context";
import { useSearchParams } from "react-router-dom";
import { getChecksumAddress } from "starknet";
import { useAccount } from "@/hooks/account";
export function TokensProvider({ children }: PropsWithChildren) {
  const { provider } = useConnection();
  const { address } = useAccount();

  return (
    <TokensProviderRaw address={address} provider={provider}>
      <ERC20ParamsRegistry>{children}</ERC20ParamsRegistry>
    </TokensProviderRaw>
  );
}

/**
 * Temporary component to register tokens from the search params until balance query is fully functional
 */
function ERC20ParamsRegistry({ children }: PropsWithChildren) {
  const [searchParams] = useSearchParams();
  const { tokens, register } = useTokens();

  useEffect(() => {
    const erc20Param = searchParams.get("erc20");
    if (!erc20Param?.length) return;

    const registered = Object.keys(tokens);

    decodeURIComponent(erc20Param)
      .split(",")
      .map(getChecksumAddress)
      .filter((address) => !registered.includes(address))
      .forEach(register);
  }, [searchParams, tokens, register]);

  return children;
}
