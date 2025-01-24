import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "@/utils/controller";

export function probe({
  setController,
  setRpcUrl,
  setOrigin,
}: {
  setController: (controller?: Controller) => void;
  setOrigin: (origin: string) => void;
  setRpcUrl: (rpcUrl: string) => void;
}) {
  return (origin: string) => {
    setOrigin(origin);

    return async (rpcUrl: string): Promise<ProbeReply> => {
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

      return Promise.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address,
      });
    };
  };
}
