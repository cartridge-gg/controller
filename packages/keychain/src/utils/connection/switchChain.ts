import { ResponseCodes } from "@cartridge/controller";
import { RpcProvider } from "starknet";
import Controller from "../controller";

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

    const nextController = await Controller.create({
      appId: controller.appId(),
      classHash: controller.classHash(),
      chainId,
      rpcUrl,
      address: controller.address(),
      username: controller.username(),
      owner: controller.owner(),
    });

    setRpcUrl(rpcUrl);
    setController(nextController);
    window.controller = nextController;

    return Promise.resolve();
  };
}
