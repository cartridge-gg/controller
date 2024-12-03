import { ConnectReply, SessionPolicies } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";

export function connectFactory({
  setOrigin,
  setRpcUrl,
  setPolicies,
  setContext,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setPolicies: (policies: SessionPolicies) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) =>
    (policies: SessionPolicies, rpcUrl: string): Promise<ConnectReply> => {
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
