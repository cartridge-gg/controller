import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "@/utils/controller";

export function probe({
  setController,
}: {
  setController: (controller?: Controller) => void;
}) {
  return (origin: string) => async (): Promise<ProbeReply> => {
    const controller = Controller.fromStore(origin);
    if (!controller) {
      return Promise.reject({
        code: ResponseCodes.NOT_CONNECTED,
      });
    }

    setController(controller);
    window.controller = controller;
    return Promise.resolve({
      code: ResponseCodes.SUCCESS,
      address: controller.address,
      rpcUrl: controller.rpcUrl(),
    });
  };
}
