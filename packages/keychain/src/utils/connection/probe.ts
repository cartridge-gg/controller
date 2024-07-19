import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "utils/controller";

export function probeFactory(setController: (controller: Controller) => void) {
  return (controller: Controller, _origin: string) =>
    (rpcUrl?: string): Promise<ProbeReply> => {
      if (rpcUrl && rpcUrl !== controller.rpcUrl) {
        controller.delete();
        setController(undefined);
        return Promise.reject({
          code: ResponseCodes.NOT_CONNECTED,
        });
      }

      return Promise.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address,
      });
    };
}
