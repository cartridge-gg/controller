import { ConnectReply, Policy } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";

export function connectFactory({
  setOrigin,
  setRpcUrl,
  setContext,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) =>
    (_: Policy[], rpcUrl: string): Promise<ConnectReply> => {
      setOrigin(origin);
      setRpcUrl(rpcUrl);

      return new Promise((resolve, reject) => {
        setContext({
          type: "connect",
          origin,
          resolve,
          reject,
        } as ConnectCtx);
      });
    };
}
