import { ResponseCodes } from "@cartridge/controller";
import Controller from "../controller";
import { RpcProvider } from "starknet";

export function switchChain({
  setController,
  setRpcUrl,
}: {
  setController: (controller?: Controller) => void;
  setRpcUrl: (rpcUrl: string) => void;
}) {
  return async (rpcUrl: string): Promise<void> => {
    if (!window.controller) {
      return Promise.reject({
        code: ResponseCodes.NOT_CONNECTED,
      });
    }

    const controller: Controller = window.controller;
    const provider = new RpcProvider({ nodeUrl: rpcUrl });
    const chainId = await provider.getChainId();

    const nextController = new Controller({
      appId: controller.appId(),
      classHash: controller.classHash(),
      chainId: chainId,
      rpcUrl: rpcUrl,
      address: controller.address(),
      username: controller.username(),
      owner: await controller.owner(),
    });

    setRpcUrl(rpcUrl);
    setController(nextController);
    window.controller = nextController;

    return Promise.resolve();
  };
}
