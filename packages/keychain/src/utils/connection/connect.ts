import { ConnectReply, Policy } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";
import Controller from "utils/controller";

export function connectFactory({
  setRpcUrl,
  setContext,
}: {
  setRpcUrl: (url: string) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) =>
    (
      policies: Policy[],
      rpcUrl: string,
    ): Promise<ConnectReply> => {
      setRpcUrl(rpcUrl);

      return new Promise((resolve, reject) => {
        setContext({
          type: "connect",
          origin,
          policies,
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
