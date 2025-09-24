export function switchChain({
  switchChain,
}: {
  switchChain: (rpcUrl: string) => Promise<void>;
}) {
  return async (rpcUrl: string): Promise<void> => {
    return switchChain(rpcUrl);
  };
}
