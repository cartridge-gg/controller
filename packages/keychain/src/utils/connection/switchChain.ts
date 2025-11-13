import { ResponseCodes } from "@cartridge/controller";
import Controller from "../controller";
import { toast, showNetworkSwitchToast } from "@cartridge/ui";
import { shortString } from "starknet";

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
      appId: controller.appId(),
      classHash: controller.classHash(),
      rpcUrl,
      address: controller.address(),
      username: controller.username(),
      owner: controller.owner(),
    });

    setRpcUrl(rpcUrl);
    setController(nextController);
    window.controller = nextController;

    const chainId = nextController.chainId();
    const chainDisplay = shortString.decodeShortString(chainId);

    toast(
      showNetworkSwitchToast({
        networkName: chainDisplay,
        duration: 3000,
      }),
    );

    return Promise.resolve();
  };
}
