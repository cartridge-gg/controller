import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "utils/controller";

export function probe(controller: Controller, _origin: string) {
  return (rpcUrl?: string): Promise<ProbeReply> => {
    if (rpcUrl && rpcUrl !== controller.rpcUrl) {
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
