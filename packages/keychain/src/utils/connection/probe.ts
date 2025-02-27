import { ProbeReply, ResponseCodes } from "@cartridge/controller";
import Controller from "#utils/controller";

export function probe({
  setController,
}: {
  setController: (controller?: Controller) => void;
}) {
  return (origin: string) =>
    // The ignored param is rpcUrl which is no longer needed but have to be kept for compatibility
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_: string): Promise<ProbeReply> => {
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
        address: controller.address(),
        rpcUrl: controller.rpcUrl(),
      });
    };
}
