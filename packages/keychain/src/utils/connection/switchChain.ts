import { ResponseCodes } from "@cartridge/controller";

export function switchChain({
  setRpcUrl,
}: {
  setRpcUrl: (rpcUrl: string) => void;
}) {
  return async (rpcUrl: string): Promise<void> => {
    if (!window.controller) {
      return Promise.reject({
        code: ResponseCodes.NOT_CONNECTED,
      });
    }

    setRpcUrl(rpcUrl);
    await window.controller.switchChain(rpcUrl);

    return Promise.resolve();
  };
}
