export function switchChain({
  switchChainFromHook,
}: {
  switchChainFromHook: (rpcUrl: string) => Promise<void>;
}) {
  return async (rpcUrl: string): Promise<void> => {
    return switchChainFromHook(rpcUrl);
  };
}
