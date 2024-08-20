import { ConnectReply, Policy } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";
import Controller from "utils/controller";

export function connectFactory({
  setOrigin,
  setRpcUrl,
  setPolicies,
  setContext,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setPolicies: (policies: Policy[]) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) =>
    (policies: Policy[], rpcUrl: string): Promise<ConnectReply> => {
      setOrigin(origin);
      setRpcUrl(rpcUrl);
      setPolicies(policies);

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
