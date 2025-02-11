import { ConnectReply } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";
import { Policies } from "@cartridge/presets";

export function connect({
  setRpcUrl,
  setContext,
}: {
  setRpcUrl: (url: string) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) => {
    return (policies: Policies, rpcUrl: string): Promise<ConnectReply> => {
      setRpcUrl(rpcUrl);

      return new Promise((resolve, reject) => {
        setContext({
          type: "connect",
          origin,
          policies,
          resolve,
          reject,
        } as ConnectCtx);
      }).finally(() => {
        setContext(undefined);
      }) as Promise<ConnectReply>;
    };
  };
}
