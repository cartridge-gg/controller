import { ConnectReply, toSessionPolicies } from "@cartridge/controller";
import { ConnectCtx, ConnectionCtx } from "./types";
import { Policies } from "@cartridge/presets";
import { ParsedSessionPolicies, parseSessionPolicies } from "@/hooks/session";

export function connect({
  setOrigin,
  setRpcUrl,
  setPolicies,
  setContext,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setPolicies: (policies: ParsedSessionPolicies) => void;
  setContext: (context: ConnectionCtx) => void;
}) {
  return (origin: string) => {
    setOrigin(origin);

    return (policies: Policies, rpcUrl: string): Promise<ConnectReply> => {
      setRpcUrl(rpcUrl);

      if (
        Array.isArray(policies) ? policies.length : Object.keys(policies).length
      ) {
        setPolicies(
          parseSessionPolicies({
            verified: false,
            policies: toSessionPolicies(policies),
          }),
        );
      }

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
  };
}
