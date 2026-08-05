import { useConnection } from "@/hooks/connection";
import { mainnet, sepolia } from "@starknet-start/chains";
import {
  cartridge,
  viewblock,
  voyager,
  type Explorer,
} from "@starknet-start/explorers";
import { useMemo } from "react";
import { num } from "starknet";

const EXPLORERS = { cartridge, viewblock, voyager } as const;

export type ExplorerType = keyof typeof EXPLORERS;

// Mirrors the chain list the app hands to StarknetConfig. Order matters: the
// first entry is the fallback when the controller's chain isn't one of these
// (appchains, or no controller yet), matching the library's `chains[0]`.
const CHAINS = [sepolia, mainnet];

/**
 * Resolve an explorer for the controller's current chain.
 *
 * Replaces `useExplorer` from `@starknet-start/react`, which sourced the chain
 * from StarknetConfig context. Here it comes from the connection — the same
 * value the app feeds into that config.
 */
export function useExplorer(
  explorerType: ExplorerType = "cartridge",
): Explorer {
  const { controller } = useConnection();
  const chainId = controller?.chainId();

  const chain = useMemo(() => {
    if (!chainId) return CHAINS[0];
    const id = num.toBigInt(chainId);
    return CHAINS.find((c) => c.id === id) ?? CHAINS[0];
  }, [chainId]);

  return useMemo(() => {
    const explorer = EXPLORERS[explorerType](chain);
    if (!explorer) {
      throw new Error(`Explorer "${explorerType}" is unavailable`);
    }
    return explorer;
  }, [explorerType, chain]);
}
