import { ResponseCodes } from "@cartridge/controller";
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
    const nextController = await Controller.create({
      classHash: controller.classHash(),
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
