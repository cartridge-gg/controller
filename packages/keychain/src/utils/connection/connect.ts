import { ConnectReply, Policies } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";

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
