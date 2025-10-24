import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "@/utils/controller";

export function probe({
  setController,
  setRpcUrl,
}: {
  setController: (controller?: Controller) => void;
  setRpcUrl?: (url: string) => void;
}) {
  return (origin: string) =>
    async (rpcUrl: string): Promise<ProbeReply> => {
      const controller = await Controller.fromStore(origin);
      if (!controller) {
        return Promise.reject({
          code: ResponseCodes.NOT_CONNECTED,
        });
      }

      // Update the rpcUrl in the connection context if setRpcUrl is provided
      // This ensures the keychain respects the defaultChainId from the controller
      if (setRpcUrl && rpcUrl) {
        setRpcUrl(rpcUrl);
      }

      setController(controller);
      window.controller = controller;
      return Promise.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
        rpcUrl: controller.rpcUrl(),
      });
    };
}
