import { ConnectReply, Policy } from "@cartridge/controller";
import { constants } from "starknet";
import { ConnectCtx, ConnectionCtx } from "./types";
import Controller from "utils/controller";

export function connectFactory({
  setChainId,
  setContext,
}: {
  setChainId: (chainId: constants.StarknetChainId) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) =>
    (
      policies: Policy[],
      starterPackId?: string,
      chainId?: constants.StarknetChainId,
    ): Promise<ConnectReply> => {
      if (chainId) {
        setChainId(chainId);
      }

      return new Promise((resolve, reject) => {
        setContext({
          type: "connect",
          origin,
          policies,
          starterPackId,
          resolve,
          reject,
        } as ConnectCtx);
      });
    };
}

export function disconnectFactory(
  setController: (controller: Controller) => void,
) {
  return (controller: Controller) => {
    controller.delete();
    setController(undefined);
    return;
  };
}
