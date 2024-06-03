import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "utils/controller";

export function probe(controller: Controller, origin: string) {
  return (): ProbeReply => {
    const session = controller.session(origin);
    return {
      code: ResponseCodes.SUCCESS,
      address: controller.address,
      policies: session?.policies || [],
    };
  };
}
