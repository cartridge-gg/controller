import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "@/utils/controller";

export function probe({
  setController,
  setRpcUrl,
}: {
  setController: (controller?: Controller) => void;
  setRpcUrl: (rpcUrl: string) => void;
}) {
  return (origin: string) =>
    (rpcUrl: string): Promise<ProbeReply> => {
      const controller = Controller.fromStore(origin);
      if (!controller) {
        return Promise.reject({
          code: ResponseCodes.NOT_CONNECTED,
        });
      }

      if (rpcUrl !== controller.rpcUrl()) {
        controller.disconnect().then(() => {
          setController(undefined);
        });
        return Promise.reject({
          code: ResponseCodes.NOT_CONNECTED,
        });
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
