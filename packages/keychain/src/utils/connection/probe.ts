import { constants } from "starknet";
import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "utils/controller";

export function probeFactory(chainId: constants.StarknetChainId) {
  return (controller: Controller, origin: string) => (): ProbeReply => {
    const session = controller.session(origin, chainId);
    return {
      code: ResponseCodes.SUCCESS,
      address: controller.address,
      policies: session?.policies || [],
    };
  };
}
