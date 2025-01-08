import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "@/utils/controller";

export function probeFactory({
  setController,
  setRpcUrl,
}: {
  setController: (controller?: Controller) => void;
  setRpcUrl: (rpcUrl: string) => void;
}) {
  return (origin: string) =>
    async (rpcUrl: string): Promise<ProbeReply> => {
      const controller = Controller.fromStore(origin);
      if (!controller) {
        return Promise.reject({
          code: ResponseCodes.NOT_CONNECTED,
        });
      }

      if (rpcUrl !== controller.rpcUrl()) {
        await controller.switchChain(rpcUrl);
      }

      setRpcUrl(rpcUrl);
      setController(controller);
      window.controller = controller;
      return Promise.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address,
      });
    };
}
